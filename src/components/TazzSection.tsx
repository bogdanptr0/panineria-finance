
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, getDefaultIfEmpty } from "@/lib/formatters";
import { Edit, Plus, Save, Trash, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TazzSectionProps {
  tazzItems: Record<string, number>;
  onUpdateItem: (name: string, value: number) => void;
  totalRevenue: number;
  onAddItem: (name: string) => void;
  onRenameItem: (oldName: string, newName: string) => void;
  onDeleteItem?: (name: string) => void;
  sectionType?: "bucatarie" | "tazz" | "bar"; // Add section type prop
}

const TazzSection = ({ 
  tazzItems, 
  onUpdateItem, 
  totalRevenue, 
  onAddItem, 
  onRenameItem,
  onDeleteItem,
  sectionType = "tazz" // Default to tazz if not specified
}: TazzSectionProps) => {
  const { toast } = useToast();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [newItemName, setNewItemName] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Memoize callbacks for better performance
  const handleInputChange = useCallback((name: string, valueStr: string) => {
    const value = valueStr === "" ? 0 : parseFloat(valueStr);
    onUpdateItem(name, value);
  }, [onUpdateItem]);

  const handleStartRename = useCallback((name: string) => {
    setEditingName(name);
    setNewName(name);
  }, []);

  const handleSaveRename = useCallback((oldName: string) => {
    if (newName.trim() !== "" && newName !== oldName) {
      onRenameItem(oldName, getDefaultIfEmpty(newName));
    }
    setEditingName(null);
    setNewName("");
  }, [newName, onRenameItem]);

  const handleCancelRename = useCallback(() => {
    setEditingName(null);
    setNewName("");
  }, []);

  const handleAddItem = useCallback(() => {
    if (newItemName.trim() !== "") {
      onAddItem(getDefaultIfEmpty(newItemName));
      setNewItemName("");
      setShowAddForm(false);
    }
  }, [newItemName, onAddItem]);

  const handleDeleteItem = useCallback((name: string) => {
    if (onDeleteItem) {
      onDeleteItem(name);
    }
  }, [onDeleteItem]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-800 text-white font-bold p-3">
        <h2>INCASARI - TAZZ</h2>
      </div>
      <div className="p-1">
        {Object.entries(tazzItems).map(([name, value]) => (
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

        <div className="bg-gray-200 p-2 flex justify-between items-center font-semibold">
          <span>TOTAL TAZZ</span>
          <span>{formatCurrency(totalRevenue)}</span>
        </div>
      </div>
    </div>
  );
};

export default TazzSection;
