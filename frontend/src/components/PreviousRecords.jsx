import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PreviousRecords = ({ recordsArray, handleSelectedRecord }) => {
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  const handleRecordSelect = (record, index) => {
    setSelectedRecordIndex(index === selectedRecordIndex ? null : index);
    handleSelectedRecord(record);
  };

  // Function to get a preview of content (first 30 characters)
  const getContentPreview = (content) => {
    if (!content) return "";
    return content.length > 30 ? content.substring(0, 30) + "..." : content;
  };

  return (
    <div className='w-1/2 h-full xl:w-[30%]  flex flex-col p-2 border'>      
      <div className="overflow-y-auto flex-1 w-full">
        {recordsArray && recordsArray.length > 0 ? (
          <Accordion type="multiple" className="w-full  ">
            {recordsArray.map((record, index) => (
              <div key={record.id} className={`border mb-5 ${selectedRecordIndex === index ? 'bg-gray-100' : ''}`}>
                {record.text && (
                  <AccordionItem 
                    value={`text-${record.id}`} 
                    className={`border-b `}
                    onClick={() => handleRecordSelect(record, index)}
                  >
                    <AccordionTrigger className="p-2 w-full justify-between">
                        <div className="flex justify-between w-full items-between " >
                          <span className="text-xs text-left truncate max-w-16 sm:max-w-24 md:max-w-32 ">
                            {getContentPreview(record.text)}
                          </span>
                          <span className="text-xs whitespace-nowrap  text-right">
                            {formatDate(record.created_at)}
                          </span>
                        </div>
                      </AccordionTrigger>
                    <AccordionContent className="p-2">
                      <h1 className="p-2  text-xs">
                        {record.text}
                      </h1>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {record.file_1 && (
                  <AccordionItem 
                    value={`file1-${record.id}`} 
                    className={`border-b `}
                    onClick={() => handleRecordSelect(record, index)}
                  >
                    <AccordionTrigger className="p-2 flex justify-between">
                      <span className="text-xs w-full text-left truncate max-w-56">
                        {getContentPreview(record.file_1)}
                      </span>
                      
                    </AccordionTrigger>
                    <AccordionContent className="p-2">
                      <h1 className="bg-gray-50 p-2  text-xs max-h-40 overflow-y-auto">
                        {record.file_1}
                      </h1>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {record.file_2 && (
                  <AccordionItem 
                    value={`file2-${record.id}`} 
                    className={` border-b`}
                    onClick={() => handleRecordSelect(record, index)}
                  >
                    <AccordionTrigger className="p-2 flex justify-between">
                      <span className="text-xs w-full text-left truncate max-w-56">
                        {getContentPreview(record.file_2)}
                      </span>
                     
                    </AccordionTrigger>
                    <AccordionContent className="p-2">
                      <h1 className="bg-gray-50 p-2  text-xs max-h-40 overflow-y-auto">
                        {record.file_2}
                      </h1>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </div>
            ))}
          </Accordion>
        ) : (
          <p className="text-gray-500 text-center">No records available</p>
        )}
      </div>
    </div>
  );
};

export default PreviousRecords;