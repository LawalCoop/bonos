"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, XCircle, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface BonoActionsProps {
  bonoId: string;
  estadoActual: string;
}

export function BonoActions({ bonoId, estadoActual }: BonoActionsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancelar = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/bonos/${bonoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al cancelar el bono");
      }

      router.refresh();
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cancelar el bono");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/bonos/${bonoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el bono");
      }

      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el bono");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {estadoActual !== "PAGADO" && (
            <DropdownMenuItem onClick={() => handleCambiarEstado("PAGADO")}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Marcar como Pagado
            </DropdownMenuItem>
          )}

          {estadoActual !== "UTILIZADO" && (
            <DropdownMenuItem onClick={() => handleCambiarEstado("UTILIZADO")}>
              <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
              Marcar como Utilizado
            </DropdownMenuItem>
          )}

          {estadoActual !== "PENDIENTE" && (
            <DropdownMenuItem onClick={() => handleCambiarEstado("PENDIENTE")}>
              <Clock className="h-4 w-4 mr-2 text-orange-600" />
              Marcar como Pendiente
            </DropdownMenuItem>
          )}

          {estadoActual !== "CANCELADO" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowCancelDialog(true)}
                className="text-red-600"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Bono
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este bono?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el bono como cancelado. El bono no podrá ser
              utilizado y no se contabilizará en las estadísticas de recaudación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelar}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Cancelando..." : "Sí, cancelar bono"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
