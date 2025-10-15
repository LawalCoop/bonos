"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface VentaExterna {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  email?: string;
  precio: number;
  cantidad: number;
  vendidoPor?: string;
  utilizado: boolean;
  fechaUtilizacion?: string;
  notas?: string;
  createdAt: string;
}

export default function VentasExternasPage() {
  const params = useParams();
  const router = useRouter();
  const [ventas, setVentas] = useState<VentaExterna[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    precio: "",
    cantidad: "1",
    vendidoPor: "",
    notas: "",
  });

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const res = await fetch(`/api/admin/eventos/${params.eventoId}/ventas-externas`);
      if (res.ok) {
        const data = await res.json();
        setVentas(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/admin/eventos/${params.eventoId}/ventas-externas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setDialogOpen(false);
        setFormData({
          nombre: "",
          apellido: "",
          dni: "",
          telefono: "",
          email: "",
          precio: "",
          cantidad: "1",
          vendidoPor: "",
          notas: "",
        });
        fetchVentas();
      } else {
        const error = await res.json();
        alert(error.error || "Error al crear venta");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear venta");
    }
  };

  const handleDelete = async (ventaId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta venta externa?")) return;

    try {
      const res = await fetch(
        `/api/admin/eventos/${params.eventoId}/ventas-externas/${ventaId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        fetchVentas();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar venta");
    }
  };

  const stats = {
    total: ventas.length,
    utilizados: ventas.filter((v) => v.utilizado).length,
    pendientes: ventas.filter((v) => !v.utilizado).length,
    totalEntradas: ventas.reduce((sum, v) => sum + v.cantidad, 0),
    totalRecaudado: ventas.reduce((sum, v) => sum + v.precio * v.cantidad, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ventas Externas</h1>
            <p className="text-gray-500">Gestiona ventas hechas por artistas o productoras</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Venta Externa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Apellido *</Label>
                  <Input
                    required
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>DNI *</Label>
                  <Input
                    required
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Precio *</Label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) =>
                      setFormData({ ...formData, precio: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Cantidad de Entradas *</Label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) =>
                      setFormData({ ...formData, cantidad: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Vendido Por</Label>
                  <Input
                    placeholder="Ej: Artista, Productora X, etc."
                    value={formData.vendidoPor}
                    onChange={(e) =>
                      setFormData({ ...formData, vendidoPor: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={formData.notas}
                    onChange={(e) =>
                      setFormData({ ...formData, notas: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Registros</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Entradas</p>
                <p className="text-2xl font-bold">{stats.totalEntradas}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Utilizados</p>
                <p className="text-2xl font-bold text-green-600">{stats.utilizados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Recaudado</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.totalRecaudado.toLocaleString("es-AR")}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Ventas Externas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Cargando...</p>
          ) : ventas.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No hay ventas externas registradas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comprador</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Vendido Por</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell className="font-medium">
                      {venta.apellido}, {venta.nombre}
                    </TableCell>
                    <TableCell>{venta.dni}</TableCell>
                    <TableCell>
                      {venta.telefono && <div className="text-sm">{venta.telefono}</div>}
                      {venta.email && (
                        <div className="text-xs text-gray-500">{venta.email}</div>
                      )}
                    </TableCell>
                    <TableCell>${venta.precio}</TableCell>
                    <TableCell>{venta.cantidad}</TableCell>
                    <TableCell className="font-medium">
                      ${(venta.precio * venta.cantidad).toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell>
                      {venta.vendidoPor || <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>
                      {venta.utilizado ? (
                        <Badge className="bg-green-600">Utilizado</Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(venta.createdAt), "dd/MM/yy HH:mm", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(venta.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
