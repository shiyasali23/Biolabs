"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CustomButton from "./CustomButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useUser } from "@/contexts/userContext";
import { updateUser, updateDetails, updateAdress } from "@/lib/user-api";
import { Loader } from "lucide-react";

// Data arrays for each section
const userProfileDataArray = [
  ["First Name", "first_name", "text", "string"],
  ["Last Name", "last_name", "text", "string"],
  ["Email", "email", "email", "email"],
  ["Gender", "gender", ["male", "female"], "string"],
];
const userProfileRequired = ["first_name", "last_name", "email", "gender"];

const additionalDetailsDataArray = [
  ["Height (cm)", "height", "number", "int"],
  ["Weight (kg)", "weight", "number", "int"],
  ["Date of Birth", "date_of_birth", "date", "date"],
  ["Job", "job", "text", "string"],
];

const addressDataArray = [
  ["Address", "address", "text", "string"],
  ["City", "city", "text", "string"],
  ["State", "state", "text", "string"],
  ["Zip Code", "zip_code", "text", "string"],
];

const UserDataComponent = () => {
  const { userData, userDataLoading, setUserDataLoading, handleUserdata } =
    useUser();

  // Local state for unsaved changes
  const [userProfileValues, setUserProfileValues] = useState({});
  const [additionalDetailsValues, setAdditionalDetailsValues] = useState({});
  const [addressValues, setAddressValues] = useState({});
  const [message, setMessage] = useState("");

  // Convert value to correct backend type
  const formatValue = (value, dataType) => {
    if (!value && value !== 0) return null;
    switch (dataType) {
      case "float":
        return parseFloat(value) || null;
      case "int":
        return parseInt(value, 10) || null;
      case "date":
        return value || null;
      case "email":
        return value.trim() || null;
      case "string":
        return value.toString().trim() || null;
      default:
        return value;
    }
  };

  // Handler for Profile section
  const handleUserProfileValueChange = (value, key) => {
    setMessage("");
    const field = userProfileDataArray.find((item) => item[1] === key);
    const fieldType = field?.[2];
    const dataType = field?.[3];
    const newValues = { ...userProfileValues };

    if (userProfileRequired.includes(key) && (!value || value === "")) {
      setMessage(`${key.replace("_", " ")} cannot be blank`);
      delete newValues[key];
    } else {
      if (message?.includes(key.replace("_", " "))) setMessage("");
      const normalizedValue = fieldType === "number" ? Number(value) : value;
      const normalizedOriginal =
        fieldType === "number" ? Number(userData[key]) : userData[key];
      if (normalizedValue === normalizedOriginal) {
        delete newValues[key];
      } else {
        newValues[key] = formatValue(value, dataType);
      }
    }
    setUserProfileValues(newValues);
  };

  // Handler for Additional Details section
  const handleAdditionalDetailsValueChange = (value, key) => {
    setMessage("");
    const field = additionalDetailsDataArray.find((item) => item[1] === key);
    const fieldType = field?.[2];
    const dataType = field?.[3];
    const newValues = { ...additionalDetailsValues };
    const normalizedValue = fieldType === "number" ? Number(value) : value;
    const normalizedOriginal =
      fieldType === "number" ? Number(userData[key]) : userData[key];
    if (normalizedValue === normalizedOriginal) {
      delete newValues[key];
    } else {
      newValues[key] = formatValue(value, dataType);
    }
    setAdditionalDetailsValues(newValues);
  };

  // Handler for Address section
  const handleAddressValueChange = (value, key) => {
    setMessage("");
    const field = addressDataArray.find((item) => item[1] === key);
    const fieldType = field?.[2];
    const dataType = field?.[3];
    const newValues = { ...addressValues };
    const normalizedValue = fieldType === "number" ? Number(value) : value;
    const normalizedOriginal =
      fieldType === "number" ? Number(userData[key]) : userData[key];
    if (normalizedValue === normalizedOriginal) {
      delete newValues[key];
    } else {
      newValues[key] = formatValue(value, dataType);
    }
    setAddressValues(newValues);
  };

  // Save function for each section with its corresponding update function
  const handleSave = async (section) => {
    let inputValues = {};
    setUserDataLoading(true);
    if (section === "profile") {
      inputValues = userProfileValues;
      if (Object.keys(inputValues).length === 0) return;
      const newUserData = await updateUser(inputValues);
      if (newUserData) {
        handleUserdata(newUserData);
        setUserProfileValues({});
      } else {
        setMessage("Something went wrong");
      }
    } else if (section === "details") {
      inputValues = additionalDetailsValues;
      if (Object.keys(inputValues).length === 0) return;
      const newUserData = await updateDetails(inputValues);
      if (newUserData) {
        handleUserdata(newUserData);
        setAdditionalDetailsValues({});
      } else {
        setMessage("Something went wrong");
      }
    } else if (section === "address") {
      inputValues = addressValues;
      if (Object.keys(inputValues).length === 0) return;
      const newUserData = await updateAdress(inputValues);
      if (newUserData) {
        handleUserdata(newUserData);
        setAddressValues({});
      } else {
        setMessage("Something went wrong");
      }
    }
    setUserDataLoading(false);
  };

  return (
    <div className="w-full h-full mt-5 xl:px-16 px-3 flex flex-col gap-10">
      <Accordion type="single" collapsible className="w-full">
        {/* Profile Section */}
        <AccordionItem value="profile">
          <AccordionTrigger className="text-md font-medium">
            User Profile
          </AccordionTrigger>
          <AccordionContent className="grid xl:grid-cols-2 grid-cols-1 gap-3 p-4">
            {userProfileDataArray.map(([label, key, type, dataType]) => (
              <div
                key={key}
                className="w-[230px] xl:w-[300px] h-[50px] flex items-center justify-between xl:gap-4"
              >
                <Label className="text-xs xl:text-sm">{label}:</Label>
                {Array.isArray(type) ? (
                  <Select
                    defaultValue={userData[key] || ""}
                    onValueChange={(value) =>
                      handleUserProfileValueChange(value, key)
                    }
                    className="w-[150px] xl:w-[180px] text-xs xl:text-sm rounded-none"
                  >
                    <SelectTrigger className="w-[150px] xl:w-[180px] text-xs xl:text-sm ml-5 rounded-none">
                      <SelectValue placeholder={userData[key] || "Select"} />
                    </SelectTrigger>
                    <SelectContent>
                      {type.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={type}
                    className="text-xs xl:text-sm w-[150px] xl:w-[180px] rounded-none"
                    value={
                      userProfileValues[key] !== undefined
                        ? userProfileValues[key] || ""
                        : userData[key] || ""
                    }
                    onChange={(e) =>
                      handleUserProfileValueChange(e.target.value, key)
                    }
                  />
                )}
              </div>
            ))}
            {Object.keys(userProfileValues).length > 0 && (
              <div className="flex justify-end col-span-full">
                <CustomButton
                  text={`${
                    userDataLoading ? (
                      <Loader className="animate-spin" />
                    ) : (
                      "Save"
                    )
                  }`}
                  className="w-1/4"
                  onClick={() => handleSave("profile")}
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Additional Details Section */}
        <AccordionItem value="details">
          <AccordionTrigger className="text-md font-medium">
            Additional Details
          </AccordionTrigger>
          <AccordionContent className="grid xl:grid-cols-2 grid-cols-1 gap-3 p-4">
            {additionalDetailsDataArray.map(([label, key, type, dataType]) => (
              <div
                key={key}
                className="w-[230px] xl:w-[300px] h-[50px] flex items-center justify-between xl:gap-4"
              >
                <Label className="text-xs xl:text-sm">{label}:</Label>
                <Input
                  type={type}
                  className="text-xs xl:text-sm w-[150px] xl:w-[180px] rounded-none"
                  value={
                    additionalDetailsValues[key] !== undefined
                      ? additionalDetailsValues[key] || ""
                      : userData[key] || ""
                  }
                  onChange={(e) =>
                    handleAdditionalDetailsValueChange(e.target.value, key)
                  }
                />
              </div>
            ))}
            {Object.keys(additionalDetailsValues).length > 0 && (
              <div className="flex justify-end col-span-full">
                <CustomButton
                  text={`${
                    userDataLoading ? (
                      <Loader className="animate-spin" />
                    ) : (
                      "Save"
                    )
                  }`}
                  className="w-1/4"
                  onClick={() => handleSave("details")}
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Address Section */}
        <AccordionItem value="address">
          <AccordionTrigger className="text-md font-medium">
            Address
          </AccordionTrigger>
          <AccordionContent className="grid xl:grid-cols-2 grid-cols-1 gap-3 p-4">
            {addressDataArray.map(([label, key, type, dataType]) => (
              <div
                key={key}
                className="w-[230px] xl:w-[300px] h-[50px] flex items-center justify-between xl:gap-4"
              >
                <Label className="text-xs xl:text-sm">{label}:</Label>
                <Input
                  type={type}
                  className="text-xs xl:text-sm w-[150px] xl:w-[180px] rounded-none"
                  value={
                    addressValues[key] !== undefined
                      ? addressValues[key] || ""
                      : userData[key] || ""
                  }
                  onChange={(e) =>
                    handleAddressValueChange(e.target.value, key)
                  }
                />
              </div>
            ))}
            {Object.keys(addressValues).length > 0 && (
              <div className="flex justify-end col-span-full">
                <CustomButton
                  text={`${
                    userDataLoading ? (
                      <Loader className="animate-spin" />
                    ) : (
                      "Save"
                    )
                  }`}
                  className="w-1/4"
                  onClick={() => handleSave("address")}
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {message && (
        <p className="w-full text-center text-md text-red-500 mt-4">
          {message}
        </p>
      )}
    </div>
  );
};

export default UserDataComponent;
