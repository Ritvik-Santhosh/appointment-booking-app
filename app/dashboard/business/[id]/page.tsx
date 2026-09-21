"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import BusinessMap from "@/components/BusinessMap";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import Image from "next/image";

type Business = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  coordinates: { lat: number; lng: number };
  rules: string[];
  images: string[];
  services: { name: string; price: string }[];
  unavailable_dates: string[];
  available_slots: Record<string, string[]>;
  appointments: {
    name: string;
    email: string;
    phone: string;
    date: string;
    slot: string;
    service: string;
    price: string;
  }[];
};

export default function BusinessPage() {
  const { id } = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "stores"));
        const businessList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Business[];

        console.log("URL ID:", id);
        console.log("Fetched Businesses:", businessList);

        const decodedId = decodeURIComponent(id as string);
        console.log("Decoded ID:", decodedId);

        const foundBusiness = businessList.find((biz) => biz.id.toLowerCase() === decodedId.toLowerCase());

        if (!foundBusiness) {
          toast.error("Business Page Not Found", {
            description: "The page you are looking for is under construction. Try Later",
            duration: 3000,
          });
          router.push("/dashboard");
        } else {
          setBusiness({
            ...foundBusiness,
            coordinates: foundBusiness.coordinates || { lat: 0, lng: 0 },
          });
        }
      } catch (error) {
        console.error("Error fetching business data:", error);
        toast.error("Failed to load business details");
      }
    };

    fetchBusiness();
  }, [id, router]);

  if (!business) return <p className="text-center mt-10 text-lg">Loading...</p>;

  return (
    <div className="max-w-screen-md mx-auto p-6 space-y-6">
      {/* Back to Home Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{business.name}</h1>
        <Link href="/dashboard">
          <Button variant="outline">← Back to Home</Button>
        </Link>
      </div>

      {/* ✅ Image Carousel */}
      {business.images?.length > 0 ? (
        <Carousel className="w-full rounded-lg shadow-md overflow-hidden">
          <CarouselContent className="relative w-full h-56 md:h-64">
            {business.images.map((imgSrc, index) => (
              <CarouselItem key={index} className="w-full h-full">
                <div className="relative w-full h-56 md:h-64">
                  <Image
                    src={imgSrc}
                    alt={`Image ${index + 1}`}
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
      ) : (
        <p className="text-center text-gray-500">No images available</p>
      )}

      {/* ✅ Map Section */}
      {business.coordinates ? (
        <BusinessMap lat={business.coordinates.lat} lng={business.coordinates.lng} name={business.name} />
      ) : (
        <p className="text-center text-red-500">Location data not available</p>
      )}

      {/* ✅ Business Details */}
      <div className="space-y-2">
        <p className="text-lg font-semibold">{business.address}</p>
        <p className="text-gray-600">📞 {business.phone}</p>
      </div>

      {/* ✅ Services Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="services">
          <AccordionTrigger className="font-semibold">Services & Pricing</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {(business.services || []).map((service, index) => (
                <li key={index} className="flex justify-between border-b pb-2">
                  <span>{service.name}</span>
                  <span className="font-semibold">{service.price}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* ✅ Shop Rules */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2">Shop Rules</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {(business.rules || []).map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
