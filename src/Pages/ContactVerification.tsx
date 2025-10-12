import React, { useState } from "react";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Checkbox } from "../Components/ui/checkbox";
import { MoveLeft, Upload } from "lucide-react";

export default function ContactVerification() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className=" max-w-7xl mx-auto p-4 min-h-screen">
      {/* Top header */}
      <div className="flex items-center mb-4">
        <span className="text-gray-600 cursor-pointer flex items-center gap-2">
          <MoveLeft/> Contact & Verification
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Person Details */}
          <Card className="p-4 bg-gray-50">
            <CardHeader className="px-0">
              <CardTitle>Contact Person Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="First Name"  />
                <Input placeholder="Last name" />
                <Input placeholder="Email Address" />
                <Input placeholder="Phone Number" />
              </div>
              <Input placeholder="Delivery Location" />
            </CardContent>
          </Card>

          {/* Aadhaar Verification */}
          <Card className="p-4 bg-gray-50">
            <CardHeader className="px-0">
              <CardTitle>Aadhaar Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Aadhaar Card Number" />

              {/* Upload Section */}
              <label
                htmlFor="aadhaarUpload"
                className="w-full border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
              >
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-gray-600">
                  {file ? file.name : "Upload image"}
                </span>
                <input
                  id="aadhaarUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </CardContent>
          </Card>

          {/* Checkbox + Submit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="showBid" />
              <label htmlFor="showBid" className="text-sm">
                Do you want to show your bid to other sellers?
              </label>
            </div>
            <Button className="w-32">Submit</Button>
          </div>
        </div>

        {/* Right Section - Bid Summary */}
        <Card className="p-4">
          <CardHeader className="px-0">
            <CardTitle>Bid Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="flex items-center space-x-3 border rounded-xl p-3"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/201/201818.png"
                  alt="Books"
                  className="w-12 h-12 object-contain"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                      Stationary
                    </span>
                    <span className="text-xs text-gray-600">Qty: 10</span>
                  </div>
                  <p className="font-medium text-sm">Children Books</p>
                  <p className="text-xs text-gray-500">
                    Deliver by:{" "}
                    <span className="font-semibold">10-10-2025</span>
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-2 text-sm">
              <span className="font-medium">Payment Method:</span>{" "}
              <span className="font-bold text-orange-600">COD</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}