"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AppointmentHistory() {
  const [user, setUser] = useState<{ name: string; email: string; photoURL: string } | null>(null); // Get the logged-in user
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchAppointments = async () => {
      try {
        const userRef = doc(db, "users", user.email);
        console.log("User Appointment History: ", userRef)
        const userSnap = await getDoc(userRef);
        console.log("User Appointment Snap: ", userRef)

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("UserData from snap:",userData)
          setAppointments(userData.appointments || []);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [user]);

  if (!user) return <p className="text-center mt-10">Please log in to view your appointments.</p>;

  return (
    <div className="max-w-screen-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Appointment History</h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="text-center">No appointments found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment, index) => (
              <TableRow key={index}>
                <TableCell>{appointment.store}</TableCell>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.slot}</TableCell>
                <TableCell>{appointment.service}</TableCell>
                <TableCell>{appointment.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
