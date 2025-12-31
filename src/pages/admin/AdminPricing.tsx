import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { mockPricing } from '@/data/adminMockData';
import { ServicePricing } from '@/types/admin';
import { 
  Search, 
  Edit2,
  Check,
  X,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminPricing: React.FC = () => {
  const [pricing, setPricing] = useState<ServicePricing[]>(mockPricing);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ServicePricing>>({});

  const filteredPricing = pricing.filter(service => 
    service.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) => `GH₵ ${value.toLocaleString()}`;

  const handleEdit = (service: ServicePricing) => {
    setEditingId(service.id);
    setEditValues({
      pricePerKg: service.pricePerKg,
      minWeight: service.minWeight,
      expressMultiplier: service.expressMultiplier,
    });
  };

  const handleSave = (id: string) => {
    setPricing(prev => prev.map(service => 
      service.id === id 
        ? { ...service, ...editValues }
        : service
    ));
    setEditingId(null);
    setEditValues({});
    toast.success('Pricing updated successfully');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const toggleActive = (id: string) => {
    setPricing(prev => prev.map(service => 
      service.id === id 
        ? { ...service, isActive: !service.isActive }
        : service
    ));
    const service = pricing.find(s => s.id === id);
    toast.success(`${service?.serviceName} ${service?.isActive ? 'deactivated' : 'activated'}`);
  };

  return (
    <AdminLayout title="Pricing">
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        {/* Pricing Cards */}
        <div className="space-y-3">
          {filteredPricing.map((service) => {
            const isEditing = editingId === service.id;
            
            return (
              <div
                key={service.id}
                className={`bg-card rounded-2xl border border-border/50 p-4 shadow-card transition-all ${
                  !service.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{service.serviceName}</h3>
                    <button
                      onClick={() => toggleActive(service.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {service.isActive ? (
                        <ToggleRight className="w-6 h-6 text-success" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(service)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSave(service.id)}
                        className="h-8 w-8 text-success"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancel}
                        className="h-8 w-8 text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Price per Kg */}
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground mb-1">Per Kg</p>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValues.pricePerKg}
                        onChange={(e) => setEditValues(prev => ({ 
                          ...prev, 
                          pricePerKg: Number(e.target.value) 
                        }))}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(service.pricePerKg)}
                      </p>
                    )}
                  </div>

                  {/* Min Weight */}
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground mb-1">Min Kg</p>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editValues.minWeight}
                        onChange={(e) => setEditValues(prev => ({ 
                          ...prev, 
                          minWeight: Number(e.target.value) 
                        }))}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-lg font-bold text-foreground">
                        {service.minWeight}kg
                      </p>
                    )}
                  </div>

                  {/* Express Multiplier */}
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground mb-1">Express ×</p>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.1"
                        value={editValues.expressMultiplier}
                        onChange={(e) => setEditValues(prev => ({ 
                          ...prev, 
                          expressMultiplier: Number(e.target.value) 
                        }))}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-lg font-bold text-coral">
                        {service.expressMultiplier}×
                      </p>
                    )}
                  </div>
                </div>

                {/* Express Price */}
                <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Express price</span>
                  <span className="text-sm font-semibold text-coral">
                    {formatCurrency(Math.round(service.pricePerKg * service.expressMultiplier))}/kg
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPricing.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPricing;
