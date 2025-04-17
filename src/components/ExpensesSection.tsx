import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from '@/lib/formatters';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Save, Plus, Trash2 } from 'lucide-react';
import { Collapse } from '@/components/ui/collapse';

export interface ExpensesSectionProps {
  salaryExpenses: Record<string, number>;
  distributorExpenses: Record<string, number>;
  utilitiesExpenses: Record<string, number>;
  operationalExpenses: Record<string, number>;
  otherExpenses: Record<string, number>;
  onSalaryUpdate: (name: string, value: number) => void;
  onDistributorUpdate: (name: string, value: number) => void;
  onUtilitiesUpdate: (name: string, value: number) => void;
  onOperationalUpdate: (name: string, value: number) => void;
  onOtherExpensesUpdate: (name: string, value: number) => void;
  onSalaryRename: (oldName: string, newName: string) => void;
  onDistributorRename: (oldName: string, newName: string) => void;
  onUtilitiesRename: (oldName: string, newName: string) => void;
  onOperationalRename: (oldName: string, newName: string) => void;
  onOtherExpensesRename: (oldName: string, newName: string) => void;
  onAddSalary: (name: string) => void;
  onAddDistributor: (name: string) => void;
  onSubsectionAddItem: (subsectionTitle: string, name: string) => void;
  operationalExpensesSubsections: {
    title: string;
    items: string[];
  }[];
  onDeleteSalary: (name: string) => void;
  onDeleteDistributor: (name: string) => void;
  onDeleteOperationalItem: (name: string) => void;
}

const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  salaryExpenses,
  distributorExpenses,
  utilitiesExpenses,
  operationalExpenses,
  otherExpenses,
  onSalaryUpdate,
  onDistributorUpdate,
  onUtilitiesUpdate,
  onOperationalUpdate,
  onOtherExpensesUpdate,
  onSalaryRename,
  onDistributorRename,
  onUtilitiesRename,
  onOperationalRename,
  onOtherExpensesRename,
  onAddSalary,
  onAddDistributor,
  onSubsectionAddItem,
  operationalExpensesSubsections,
  onDeleteSalary,
  onDeleteDistributor,
  onDeleteOperationalItem
}) => {
  const [editingSalary, setEditingSalary] = useState<string | null>(null);
  const [editingDistributor, setEditingDistributor] = useState<string | null>(null);
  const [editingUtilities, setEditingUtilities] = useState<string | null>(null);
  const [editingOperational, setEditingOperational] = useState<string | null>(null);
  const [editingOtherExpenses, setEditingOtherExpenses] = useState<string | null>(null);
  const [newSalaryName, setNewSalaryName] = useState('');
  const [newDistributorName, setNewDistributorName] = useState('');
  const [newUtilitiesName, setNewUtilitiesName] = useState('');
  const [newOperationalName, setNewOperationalName] = useState('');
  const [newOtherExpensesName, setNewOtherExpensesName] = useState('');

  const handleSalaryRename = (oldName: string, newName: string) => {
    onSalaryRename(oldName, newName);
    setEditingSalary(null);
  };

  const handleDistributorRename = (oldName: string, newName: string) => {
    onDistributorRename(oldName, newName);
    setEditingDistributor(null);
  };

  const handleUtilitiesRename = (oldName: string, newName: string) => {
    onUtilitiesRename(oldName, newName);
    setEditingUtilities(null);
  };

  const handleOperationalRename = (oldName: string, newName: string) => {
    onOperationalRename(oldName, newName);
    setEditingOperational(null);
  };

  const handleOtherExpensesRename = (oldName: string, newName: string) => {
    onOtherExpensesRename(oldName, newName);
    setEditingOtherExpenses(null);
  };

  return (
    <Card className="print:shadow-none">
      <CardHeader>
        <CardTitle>Cheltuieli</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Salarii */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Salarii</h3>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Nume nou"
              value={newSalaryName}
              onChange={(e) => setNewSalaryName(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onAddSalary(newSalaryName);
                setNewSalaryName('');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adaugă
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(salaryExpenses).map(([name, value]) => (
              <div key={name} className="flex items-center justify-between">
                {editingSalary === name ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      defaultValue={name}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSalaryRename(name, e.currentTarget.value);
                        }
                      }}
                      onBlur={(e) => handleSalaryRename(name, e.currentTarget.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSalary(null)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium">{name}</span>
                )}
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    defaultValue={value}
                    className="w-24 text-right"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onSalaryUpdate(name, parseFloat(e.currentTarget.value));
                      }
                    }}
                    onBlur={(e) => onSalaryUpdate(name, parseFloat(e.currentTarget.value))}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSalary(name)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSalary(name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuitori */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Distribuitori</h3>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Nume nou"
              value={newDistributorName}
              onChange={(e) => setNewDistributorName(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onAddDistributor(newDistributorName);
                setNewDistributorName('');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adaugă
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(distributorExpenses).map(([name, value]) => (
              <div key={name} className="flex items-center justify-between">
                {editingDistributor === name ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      defaultValue={name}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleDistributorRename(name, e.currentTarget.value);
                        }
                      }}
                      onBlur={(e) => handleDistributorRename(name, e.currentTarget.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDistributor(null)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium">{name}</span>
                )}
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    defaultValue={value}
                    className="w-24 text-right"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onDistributorUpdate(name, parseFloat(e.currentTarget.value));
                      }
                    }}
                    onBlur={(e) => onDistributorUpdate(name, parseFloat(e.currentTarget.value))}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingDistributor(name)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteDistributor(name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Utilitati, Operationale, Alte Cheltuieli */}
        {operationalExpensesSubsections.map((subsection) => (
          <div key={subsection.title} className="space-y-2">
            <Collapse key={subsection.title} title={subsection.title}>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Nume nou"
                  value={
                    subsection.title === "Utilitati" ? newUtilitiesName :
                      subsection.title === "Operationale" ? newOperationalName :
                        newOtherExpensesName
                  }
                  onChange={(e) => {
                    if (subsection.title === "Utilitati") {
                      setNewUtilitiesName(e.target.value);
                    } else if (subsection.title === "Operationale") {
                      setNewOperationalName(e.target.value);
                    } else {
                      setNewOtherExpensesName(e.target.value);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newName =
                      subsection.title === "Utilitati" ? newUtilitiesName :
                        subsection.title === "Operationale" ? newOperationalName :
                          newOtherExpensesName;
                    onSubsectionAddItem(subsection.title, newName);
                    if (subsection.title === "Utilitati") {
                      setNewUtilitiesName('');
                    } else if (subsection.title === "Operationale") {
                      setNewOperationalName('');
                    } else {
                      setNewOtherExpensesName('');
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subsection.items.map((name) => {
                  let value;
                  let updateFunction;
                  let renameFunction;
                  let editingState;
                  let setEditingState;

                  if (subsection.title === "Utilitati") {
                    value = utilitiesExpenses[name];
                    updateFunction = onUtilitiesUpdate;
                    renameFunction = handleUtilitiesRename;
                    editingState = editingUtilities;
                    setEditingState = setEditingUtilities;
                  } else if (subsection.title === "Operationale") {
                    value = operationalExpenses[name];
                    updateFunction = onOperationalUpdate;
                    renameFunction = handleOperationalRename;
                    editingState = editingOperational;
                    setEditingState = setEditingOperational;
                  } else {
                    value = otherExpenses[name];
                    updateFunction = onOtherExpensesUpdate;
                    renameFunction = handleOtherExpensesRename;
                    editingState = editingOtherExpenses;
                    setEditingState = setEditingOtherExpenses;
                  }

                  return (
                    <div key={name} className="flex items-center justify-between">
                      {editingState === name ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            defaultValue={name}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                renameFunction(name, e.currentTarget.value);
                              }
                            }}
                            onBlur={(e) => renameFunction(name, e.currentTarget.value)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingState(null)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-medium">{name}</span>
                      )}
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          defaultValue={value}
                          className="w-24 text-right"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateFunction(name, parseFloat(e.currentTarget.value));
                            }
                          }}
                          onBlur={(e) => updateFunction(name, parseFloat(e.currentTarget.value))}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingState(name)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteOperationalItem(name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Collapse>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExpensesSection;
