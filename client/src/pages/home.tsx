import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SearchBar } from "@/components/search-bar";
import { ClientList } from "@/components/client-list";
import { ClientForm } from "@/components/client-form";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { exportToCSV } from "@/lib/utils";
import type { Client, InsertClient } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      const res = await apiRequest("POST", "/api/clients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setFormOpen(false);
      toast({ description: "Cliente adicionado com sucesso" });
    },
    onError: () => {
      toast({ description: "Erro ao adicionar cliente", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertClient }) => {
      const res = await apiRequest("PATCH", `/api/clients/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setFormOpen(false);
      setEditingClient(null);
      toast({ description: "Cliente atualizado com sucesso" });
    },
    onError: () => {
      toast({ description: "Erro ao atualizar cliente", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ description: "Cliente excluído com sucesso" });
    },
    onError: () => {
      toast({ description: "Erro ao excluir cliente", variant: "destructive" });
    },
  });

  const cities = Array.from(new Set(clients.map((client) => client.city))).sort();

  const filteredClients = clients.filter((client) => {
    const matchesSearch = searchQuery === "" ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.crm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity === "all" || client.city === selectedCity;

    return matchesSearch && matchesCity;
  });

  const handleSubmit = (data: InsertClient) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingClient(null);
  };

  const handleExport = () => {
    if (filteredClients.length === 0) {
      toast({
        description: "Não há clientes para exportar",
        variant: "destructive"
      });
      return;
    }
    exportToCSV(filteredClients);
    toast({ description: "Dados exportados com sucesso" });
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="header-actions flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button className="w-full sm:w-auto" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        selectedCity={selectedCity}
        cities={cities}
        onSearchChange={setSearchQuery}
        onCityChange={setSelectedCity}
      />

      <div className="mt-6">
        <ClientList
          clients={filteredClients}
          onEdit={handleEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </div>

      <ClientForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        defaultValues={editingClient || undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}