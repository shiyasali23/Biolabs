"use client";
import { headingCase } from "@/lib/heading-case";
import React, { useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FoodNutrientList = ({ itemsArray, selectedItem, handleSelectedItem, isFood, groupByCategory = false }) => {
  // Group items by category (or subCategory if available)
  const categorizedItems = useMemo(() => {
    return itemsArray.reduce((acc, { category, subCategory, name }) => {
      const categoryKey = groupByCategory ? category : subCategory || category;
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      acc[categoryKey].push(name);
      return acc;
    }, {});
  }, [itemsArray, groupByCategory]);

  // Compute the default open accordion based on selectedItem
  const defaultAccordionValue = useMemo(() => {
    if (groupByCategory || !selectedItem) return undefined;
    for (const [category, items] of Object.entries(categorizedItems)) {
      if (items.includes(selectedItem)) return category;
    }
    return undefined;
  }, [categorizedItems, selectedItem, groupByCategory]);

  return (
    <div className="w-full bg-white">
      <Accordion 
        type="single" 
        defaultValue={defaultAccordionValue} 
        collapsible
        // Using a key ensures the Accordion re-mounts when defaultAccordionValue changes.
        key={defaultAccordionValue || "none"}
      >
        {Object.entries(categorizedItems).map(([category, items]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="w-full px-0 py-3 text-left text-sm font-medium hover:no-underline">
              {headingCase(category)}
            </AccordionTrigger>
            <AccordionContent className={isFood ? "grid grid-cols-1 gap-1 px-0 sm:grid-cols-2" : "flex flex-col gap-1 px-0"}>
              {items.map((item) => (
                <button
                  type="button"
                  onClick={() => handleSelectedItem(item, isFood)}
                  key={item}
                  className={`w-full rounded-md border px-3 py-2 text-left text-xs font-medium transition ${
                    item === selectedItem ? "border-[var(--biolabs-teal)] bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal-dark)]" : "border-transparent hover:bg-[var(--biolabs-porcelain)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FoodNutrientList;
