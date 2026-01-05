'use client'

import { useState, useMemo } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CrearArtistaDialog } from './crear-artista-dialog'

type Artista = {
  id: string
  nombre: string
}

type ArtistaComboboxProps = {
  artistas: Artista[]
  value: string
  onValueChange: (value: string) => void
  excludeIds?: string[]
  placeholder?: string
  onArtistaCreado?: (artista: Artista) => void
}

export function ArtistaCombobox({
  artistas,
  value,
  onValueChange,
  excludeIds = [],
  placeholder = 'Seleccionar artista...',
  onArtistaCreado,
}: ArtistaComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Filtrar artistas excluidos
  const artistasDisponibles = useMemo(
    () => artistas.filter((a) => !excludeIds.includes(a.id)),
    [artistas, excludeIds]
  )

  // Encontrar artista seleccionado
  const selectedArtista = artistasDisponibles.find((a) => a.id === value)

  // Filtrar artistas por búsqueda
  const artistasFiltrados = useMemo(() => {
    if (!searchQuery) return artistasDisponibles
    const query = searchQuery.toLowerCase()
    return artistasDisponibles.filter((a) =>
      a.nombre.toLowerCase().includes(query)
    )
  }, [artistasDisponibles, searchQuery])

  const handleSelect = (artistaId: string) => {
    onValueChange(artistaId === value ? '' : artistaId)
    setOpen(false)
    setSearchQuery('')
  }

  const handleCrearNuevo = () => {
    setOpen(false)
    setDialogOpen(true)
  }

  const handleArtistaCreado = (artista: Artista) => {
    // Notificar al padre
    if (onArtistaCreado) {
      onArtistaCreado(artista)
    }
    // Seleccionar el artista recién creado
    onValueChange(artista.id)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedArtista ? selectedArtista.nombre : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar artista..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 py-6">
                  <p className="text-sm text-muted-foreground">
                    No se encontró el artista
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCrearNuevo}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Crear nuevo artista
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {artistasFiltrados.map((artista) => (
                  <CommandItem
                    key={artista.id}
                    value={artista.id}
                    onSelect={() => handleSelect(artista.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === artista.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {artista.nombre}
                  </CommandItem>
                ))}
              </CommandGroup>
              {artistasFiltrados.length > 0 && (
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCrearNuevo}
                    className="border-t"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nuevo artista
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CrearArtistaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onArtistaCreado={handleArtistaCreado}
      />
    </>
  )
}
