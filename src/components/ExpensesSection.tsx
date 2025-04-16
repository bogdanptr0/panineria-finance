
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, getDefaultIfEmpty } from "@/lib/formatters";
import { Edit, Plus, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExpensesSectionProps {
  title: string;
  items: Record<string, number>;
  onUpdateItem: (name: string, value: number) => void;
  totalExpenses: number;
  onAddItem: (name: string) => void;
  onRenameItem: (oldName: string, newName: string) => void;
  subsections?: {
    title: string;
    items: string[];
  }[];
}

const ExpensesSection = ({ 
  title, 
  items, 
  onUpdateItem, 
  totalExpenses, 
  onAddItem, 
  onRenameItem,
  subsections 
}: ExpensesSectionProps) => {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [newItemName, setNewItemName] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const handleInputChange = (name: string, valueStr: string) => {
    const value = valueStr === "" ? 0 : parseFloat(valueStr);
    onUpdateItem(name, value);
  };

  const handleStartRename = (name: string) => {
    setEditingName(name);
    setNewName(name);
  };

  const handleSaveRename = (oldName: string) => {
    if (newName.trim() !== "" && newName !== oldName) {
      onRenameItem(oldName, getDefaultIfEmpty(newName));
    }
    setEditingName(null);
    setNewName("");
  };

  const handleCancelRename = () => {
    setEditingName(null);
    setNewName("");
  };

  const handleAddItem = () => {
    if (newItemName.trim() !== "") {
      onAddItem(getDefaultIfEmpty(newItemName));
      setNewItemName("");
      setShowAddForm(false);
    }
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // If subsections are provided, render with subsections
  if (subsections) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-800 text-white font-bold p-3">
          <h2>{title}</h2>
        </div>
        <div className="p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right w-32">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subsections.map((subsection) => (
                <React.Fragment key={subsection.title}>
                  <TableRow 
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200"
                    onClick={() => toggleSection(subsection.title)}
                  >
                    <TableCell colSpan={2} className="py-2">
                      <div className="flex items-center">
                        {collapsedSections[subsection.title] ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronUp className="h-4 w-4 mr-2" />
                        )}
                        <span className="font-medium">{subsection.title}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {!collapsedSections[subsection.title] && subsection.items.map((name) => (
                    <TableRow key={name}>
                      <TableCell>
                        {editingName === name ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="flex-1"
                              autoFocus
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleSaveRename(name)}
                              className="h-8 w-8"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={handleCancelRename}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-800 flex-1">{name}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleStartRename(name)}
                              className="h-8 w-8 text-gray-500 hover:text-gray-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <span className="mr-2 text-gray-600">RON</span>
                          <Input
                            type="number"
                            value={items[name] || ""}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            className="text-right w-24"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {!collapsedSections[subsection.title] && subsection.title === "Alte Cheltuieli" && (
                    <>
                      {showAddForm ? (
                        <TableRow className="bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="New item name"
                                className="flex-1"
                                autoFocus
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleAddItem}
                                className="h-8 w-8"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setShowAddForm(false)}
                                className="h-8 w-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setShowAddForm(true)}
                              className="flex items-center text-gray-600 hover:text-gray-800"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              <span>Add New Item</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
              
              <TableRow className="bg-gray-200">
                <TableCell className="font-semibold">TOTAL</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(totalExpenses)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // The original layout for sections without subsections
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-800 text-white font-bold p-3">
        <h2>{title}</h2>
      </div>
      <div className="p-1">
        {Object.entries(items).map(([name, value]) => (
          <div key={name} className="border-b flex justify-between items-center p-2">
            {editingName === name ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleSaveRename(name)}
                  className="h-8 w-8"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCancelRename}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-gray-800 flex-1">{name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleStartRename(name)}
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center w-32">
              <span className="mr-2 text-gray-600">RON</span>
              <Input
                type="number"
                value={value || ""}
                onChange={(e) => handleInputChange(name, e.target.value)}
                className="text-right"
              />
            </div>
          </div>
        ))}

        {showAddForm ? (
          <div className="border-b flex justify-between items-center p-2 bg-gray-50">
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="New item name"
                className="flex-1"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleAddItem}
                className="h-8 w-8"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAddForm(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="w-32"></div>
          </div>
        ) : (
          <div className="p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAddForm(true)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Add New Item</span>
            </Button>
          </div>
        )}

        <div className="bg-gray-200 p-2 flex justify-between items-center font-semibold">
          <span>TOTAL</span>
          <span>{formatCurrency(totalExpenses)}</span>
        </div>
      </div>
    </div>
  );
};

export default ExpensesSection;
