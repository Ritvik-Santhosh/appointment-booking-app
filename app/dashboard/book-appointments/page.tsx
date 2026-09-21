"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BookNowModal from "@/components/BookNowModal";

type Business = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  images: string[];
  services: { name: string; price: string }[];
};

export default function BookAppointments() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [selectedServices, setSelectedServices] = useState<{ [key: string]: { name: string; price: string } }>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const querySnapshot = await getDocs(collection(db, "stores"));
      const businessList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        images: doc.data().images || [],
      })) as Business[];

      setBusinesses(businessList);
      const uniqueCategories = Array.from(new Set(businessList.map((biz) => biz.category)));
      setCategories(uniqueCategories);
    };

    fetchBusinesses();
  }, []);

  const handleServiceChange = (businessId: string, serviceName: string) => {
    const business = businesses.find((b) => b.id === businessId);
    const selectedService = business?.services.find((s) => s.name === serviceName);
    if (selectedService) {
      setSelectedServices((prev) => ({
        ...prev,
        [businessId]: selectedService,
      }));
    }
  };

  const filteredBusinesses = selectedCategory
    ? businesses.filter((biz) => biz.category === selectedCategory)
    : businesses;

  return (
    <div className="space-y-6 max-w-screen-lg mx-auto p-4">
      <h1 className="text-2xl font-bold text-center">Book Appointments</h1>

      {/* Category Tabs */}
      <div className="w-full flex justify-center">
        <Tabs defaultValue="all" className="w-full max-w-screen-lg">
          <TabsList className="flex flex-wrap justify-center gap-2">
            <TabsTrigger value="all" onClick={() => setSelectedCategory(null)}>All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} onClick={() => setSelectedCategory(category)}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Business Listing */}
      <div className="space-y-6">
        {filteredBusinesses.map((business) => (
          <Card key={business.id} className="p-4 flex flex-col md:flex-row w-full min-h-64 md:h-auto">
            
            {/* Left: Image Carousel */}
            <div className="w-full md:w-[40%] relative">
              <Carousel className="relative w-full h-56 md:h-56">
                <CarouselContent className="w-full h-full">
                  {(business.images || []).map((imgSrc, index) => (
                    <CarouselItem key={index} className="w-full h-full">
                      <div className="relative w-full h-56 md:h-56">
                        <Image
                          src={imgSrc}
                          alt={`${business.name} image ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                          unoptimized
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full shadow-md hover:bg-opacity-80 transition" />
                <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full shadow-md hover:bg-opacity-80 transition" />
              </Carousel>
            </div>

            {/* Right: Business Details */}
            <div className="w-full md:w-[60%] px-4 flex flex-col gap-2">
              <h2 className="text-lg font-bold">{business.name}</h2>
              <p className="text-gray-600">{business.address}</p>
              <p className="text-gray-600">📞 {business.phone}</p>

              {/* Service Dropdown */}
              <Select onValueChange={(value) => handleServiceChange(business.id, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {(business.services || []).map((service, index) => (
                    <SelectItem key={index} value={service.name}>
                      {service.name} - {service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Buttons */}
              <div className="flex justify-between mt-auto">
                <Link href={`/dashboard/business/${business.id}`}>
                  <Button variant="outline">More Details</Button>
                </Link>
                {business.services?.length > 0 ? (
                  <BookNowModal 
                    businessId={business.id} 
                    selectedService={selectedServices[business.id] || business.services[0]} 
                    user={{ name: user?.name || "", email: user?.email || "" }} 
                  />
                ) : (
                  <Button disabled variant="outline">No Services Available</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
