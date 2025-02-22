import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Client } from "@shared/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCSV(clients: Client[], filename: string = 'clientes.csv') {
  // Define CSV headers
  const headers = ['Nome', 'CRM', 'Telefone', 'Email', 'Endereço', 'Cidade'];

  // Convert clients to CSV rows
  const rows = clients.map(client => [
    client.name,
    client.crm,
    client.phone,
    client.email,
    client.address,
    client.city
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}