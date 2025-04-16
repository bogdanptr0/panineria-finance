import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, getDefaultIfEmpty } from "@/lib/formatters";
import { Edit, Plus, Save, Trash, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubsectionType {
  title: string;
  items: string[];
}

interface RevenueSectionProps {
  revenueItems: Record<string, number>;
  onUpdateItem: (name: string, value: number) => void;
  totalRevenue: number;
  onAddItem: (name: string, subsectionTitle?: string) => void;
  onRenameItem: (oldName: string, newName: string) => void;
  onDeleteItem?: (name: string) => void;
  subsections?: SubsectionType[];
}

const RevenueSection = ({ 
  revenueItems, 
  onUpdateItem, 
  totalRevenue, 
  onAddItem, 
  onRenameItem,
  onDeleteItem,
  subsections
}: RevenueSectionProps) => {
  const { toast } = useToast();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [newItemName, setNewItemName] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [addingToSubsection, setAddingToSubsection] = useState<string | null>(null);

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
      onAddItem(getDefaultIfEmpty(newItemName), addingToSubsection || undefined);
      setNewItemName("");
      setShowAddForm(false);
      setAddingToSubsection(null);
      
      toast({
        title: "Item added",
        description: `"${newItemName}" has been added to the list`,
      });
    }
  };

  const handleStartAddToSubsection = (subsectionTitle: string) => {
    setAddingToSubsection(subsectionTitle);
    setShowAddForm(true);
  };

  const handleDeleteItem = (name: string) => {
    if (onDeleteItem) {
      onDeleteItem(name);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-800 text-white font-bold p-3">
        <h2>INCASARI</h2>
      </div>
      <div className="p-1">
        {subsections ? (
          subsections.map((subsection) => (
            <div key={subsection.title} className="mb-2">
              <div className="bg-gray-700 text-white font-semibold p-2">
                <span>{subsection.title}</span>
              </div>
              
              <div>
                {subsection.items.map((name) => (
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
                        {onDeleteItem && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteItem(name)}
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    <div className="flex items-center w-32">
                      <span className="mr-2 text-gray-600">RON</span>
                      <Input
                        type="number"
                        value={revenueItems[name] || ""}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        className="text-right"
                      />
                    </div>
                  </div>
                ))}
                
                {showAddForm && addingToSubsection === subsection.title ? (
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
                        onClick={() => {
                          setShowAddForm(false);
                          setAddingToSubsection(null);
                        }}
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
                      onClick={() => handleStartAddToSubsection(subsection.title)}
                      className="flex items-center text-gray-600 hover:text-gray-800"
                      type="button"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Add New Item to {subsection.title}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <>
            {Object.entries(revenueItems).map(([name, value]) => (
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
                    {onDeleteItem && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteItem(name)}
                        className="h-8 w-8 text-gray-500 hover:text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
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
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add New Item</span>
                </Button>
              </div>
            )}
          </>
        )}

        <div className="bg-gray-200 p-2 flex justify-between items-center font-semibold">
          <span>TOTAL</span>
          <span>{formatCurrency(totalRevenue)}</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueSection;
