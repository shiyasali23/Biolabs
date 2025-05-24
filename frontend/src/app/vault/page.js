"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/userContext";
import { useRecord } from "@/contexts/recordContext";
import NoDataFound from "@/components/NoDataFound";
import LoadingComponent from "@/components/LoadingComponent";
import PreviousRecords from "@/components/PreviousRecords";
import Intelligence from "@/components/Intelligence";
import HealthInputPanel from "@/components/HealthInputPanel";
import { FaTimes } from "react-icons/fa";

const Vault = () => {
  const { isLogined, userDataLoading } = useUser();
  const { recordsArray, recordsLoading, updateRecord, fetchRecords } =
    useRecord();
  
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [extractedTexts, setExtractedTexts] = useState([]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isLogined && !recordsArray && !recordsLoading) {
      fetchRecords();
    }
  }, [recordsArray]);
     
  const handleSend = (data) => {
    console.log("data from vault page", data);
    // Handle successful save - could refresh records or show success message
    if (data && !data.error) {
      // Optionally refresh records after successful save
      fetchRecords();
    }
  };

  const handleSelectedRecord = (record) => {
    if (!record) return;

    setText(record.text || "");

    const newExtractedTexts = [];
    if (record.file_1) newExtractedTexts.push(record.file_1);
    if (record.file_2) newExtractedTexts.push(record.file_2);

    // Ensure we only keep at most 2 extracted texts
    setExtractedTexts(newExtractedTexts.slice(0, 2));
  };

  return (
    <div className="w-screen h-[92vh] xl:h-[88vh] flex flex-col items-center justify-center">
      {message && <p className="text-red-500">{message}</p>}
      {recordsLoading || userDataLoading ? (
        <LoadingComponent text={"Processing Records."} />
      ) : !isLogined ? (
        <NoDataFound isOpen={true} isModal={false} route={"vault"} />
      ) : (
        <div className="flex h-full w-full gap-2 xl:gap-5 px-2 py-4">
          {recordsArray && recordsArray.length !== 0 && (
            <PreviousRecords
              recordsArray={recordsArray}
              handleSelectedRecord={handleSelectedRecord}
            />
          )}
          <div className="w-full">
            <HealthInputPanel
              setIntelligenceOpen={setIntelligenceOpen}
              isIntelligence={false}
              handleSend={handleSend}
              updateRecord={updateRecord}
              isLogined={isLogined}
              text={text}
              setText={setText}
              extractedTexts={extractedTexts}
              setExtractedTexts={setExtractedTexts}
              setMessage={setMessage}
            />
            {extractedTexts && extractedTexts.length > 0 && (
              <div className="  shadow-sm mt-5 overflow-hidden h-full border flex flex-col items-start justify-start overflow-y-auto p-2">
                {extractedTexts.map((text, index) => (
                  <div
                    key={`extracted-${index}`}
                    className="mb-3 p-2 bg-gray-50  relative"
                  >
                    <FaTimes
                      onClick={() =>
                        setExtractedTexts(
                          extractedTexts.filter((_, i) => i !== index)
                        )
                      }
                      className="absolute top-3 right-5 text-gray-600 cursor-pointer hover:text-gray-800 hover:scale-110"
                    />
                    <p className="text-sm text-gray-700 p-5 break-words">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Intelligence
        isOpen={intelligenceOpen}
        onClose={() => setIntelligenceOpen(false)}
        text={text}
        extractedTexts={extractedTexts}
        setMessage={setMessage}
      />
    </div>
  );
};

export default React.memo(Vault);