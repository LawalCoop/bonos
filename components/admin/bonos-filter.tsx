"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BonosFilterProps {
  defaultSearch?: string;
  defaultEstado?: string;
}

export function BonosFilter({ defaultSearch, defaultEstado }: BonosFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(defaultSearch || "");
  const [estado, setEstado] = useState(defaultEstado || "TODOS");

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (search) {
      params.set("q", search);
    }

    if (estado && estado !== "TODOS") {
      params.set("estado", estado);
    }

    router.push(`/admin/bonos?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearch("");
    setEstado("TODOS");
    router.push("/admin/bonos");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm">Buscar</Label>
          <Input
            id="search"
            placeholder="Código, email, nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado" className="text-sm">Estado</Label>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger id="estado" className="text-sm">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los estados</SelectItem>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="PAGADO">Pagado</SelectItem>
              <SelectItem value="UTILIZADO">Utilizado</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
          Aplicar Filtros
        </Button>
        {(search || (estado && estado !== "TODOS")) && (
          <Button onClick={handleClearFilters} variant="outline" className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
