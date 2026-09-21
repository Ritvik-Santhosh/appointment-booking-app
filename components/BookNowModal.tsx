"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

type BookNowModalProps = {
  businessId: string;
  selectedService: { name: string; price: string };
  user: { name: string; email: string };
};

export default function BookNowModal({ businessId, selectedService, user }: BookNowModalProps) {
  const [business, setBusiness] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ ...user, phone: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const businessRef = doc(db, "stores", businessId);
        const businessSnap = await getDoc(businessRef);
  
        if (businessSnap.exists()) {
          const businessData = businessSnap.data();
          console.log("Fetched Business Data:", businessData); // ✅ Debugging
          setBusiness(businessData); 
        } else {
          toast.error("Business not found");
        }
      } catch (error) {
        console.error("Error fetching business data:", error);
        toast.error("Failed to load business details");
      }
    };
  
    fetchBusinessData();
  }, [businessId]);

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
  
    const formattedDate = date.getFullYear() + "-" + 
                      String(date.getMonth() + 1).padStart(2, "0") + "-" + 
                      String(date.getDate()).padStart(2, "0");

    setSelectedDate(formattedDate);
  
    // ✅ Fix: Ensure `available_slots` is fetched correctly
    const slots = business?.time_slots || [];
    setAvailableSlots(slots);
    setSelectedSlot(null);
  
    console.log("Selected Date:", formattedDate);
    console.log("Available Slots:", slots);
  };
  
  

  // Handle booking confirmation
  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !customer.phone) {
      toast.error("Please select a date, time slot, and enter a phone number.");
      return;
    }
  
    setLoading(true);
  
    try {
      const storeRef = doc(db, "stores", businessId);
      const businessSnap = await getDoc(storeRef);
      if (!businessSnap.exists()) throw new Error("Business not found");
  
      const businessData = businessSnap.data();
      const newAppointment = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        date: selectedDate,
        slot: selectedSlot,
        service: selectedService.name,
        price: selectedService.price,
        status:"booked"
      };
  
      await updateDoc(storeRef, {
        appointments: arrayUnion(newAppointment)
      });
  
      // ✅ Create or Update User Appointment Record
      const userRef = doc(db, "users", customer.email); // Use email as document ID
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        // ✅ If User Exists, Add New Appointment
        await updateDoc(userRef, {
          appointments: arrayUnion({
            store: businessData.name,
            date: selectedDate,
            slot: selectedSlot,
            service: selectedService.name,
            price: selectedService.price,
            status: "booked"
          })
        });
      } else {
        // ✅ If User Does Not Exist, Create New User Document
        await setDoc(userRef, {
          email: customer.email,
          name: customer.name,
          phone:customer.phone,
          appointments: [
            {
              store: businessData.name,
              date: selectedDate,
              slot: selectedSlot,
              service: selectedService.name,
              price: selectedService.price
            }
          ]
        });
      }
  
      // ✅ Send SMS via Twilio
      const smsResponse = await fetch("/api/sendSMS", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: customer.phone,
          message: `Your appointment for ${selectedDate} at ${selectedSlot} is confirmed.`,
          carrierDomain: "pcs.rogers.com" // Change this based on the user's carrier
        }),
      });
  
      // ✅ Send Email via ReSend
      const emailResponse = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customer.email,
          message: `Your appointment for ${selectedDate} at ${selectedSlot} is confirmed.`,
        }),
      });
  
      // ✅ Check API Responses
      if (!smsResponse.ok) throw new Error("Failed to send SMS");
      if (!emailResponse.ok) throw new Error("Failed to send Email");
  
      toast.success("Appointment successfully booked!");
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Failed to book appointment.");
    }
  
    setLoading(false);
  };
  

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Book Now</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Book an Appointment</DialogTitle>
        <DialogDescription>Choose your preferred service and confirm your booking.</DialogDescription>

        <p className="font-semibold">Service Chosen: {selectedService.name} - {selectedService.price}</p>

        {/* Date Picker */}
        <DatePicker
            selected={selectedDate ? new Date(selectedDate) : null}
            onChange={handleDateChange}
            excludeDates={business?.unavailable_dates?.map((date: string) => {
                const parts = date.split("-");
                return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              }) || []}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a Date"
            className="border rounded p-2 w-full"
            customInput={<Input placeholder="Select a Date" />}
            popperPlacement="bottom"
            popperModifiers={[
                {
                name: "preventOverflow",
                options: {
                    boundary: "viewport",
                },
                fn: ({ x, y }) => ({ x, y }) // ✅ Fix: Provide a valid function
                }
            ]}
            />


        {/* Show Time Slot Dropdown Only If Date is Selected */}
        {selectedDate && availableSlots.length > 0 && (
        <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700">Select Time Slot</label>
            <select
            className="border rounded p-2 w-full"
            onChange={(e) => setSelectedSlot(e.target.value)}
            >
            <option value="">Choose a Time Slot</option>
            {availableSlots.map((slot, index) => (
                <option key={index} value={slot}>{slot}</option>
            ))}
            </select>
        </div>
        )}

        <Input
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          placeholder="Your Name"
          className="mt-2"
        />
        <Input
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          placeholder="Your Email"
          className="mt-2"
        />
        <Input
          placeholder="Phone Number"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          className="mt-2"
        />

        
        <Button
        onClick={handleBooking}
        disabled={!selectedDate || !selectedSlot || !customer.phone || loading} // Disable during loading
        className="mt-4 w-full flex items-center justify-center gap-2"
        >
        {loading ? (
            <>
            <Loader2 className="animate-spin h-5 w-5" /> Booking...
            </>
        ) : (
            "Confirm Booking"
        )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
