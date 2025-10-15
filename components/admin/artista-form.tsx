"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import slugify from "slugify";

interface ArtistaFormProps {
  artista?: any;
}

export function ArtistaForm({ artista }: ArtistaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: artista?.nombre || "",
    slug: artista?.slug || "",
    bio: artista?.bio || "",
    ciudad: artista?.ciudad || "",
    provincia: artista?.provincia || "",
    pais: artista?.pais || "Argentina",
    esLocal: artista?.esLocal || false,
    foto: artista?.foto || "",
    linkInstagram: artista?.linkInstagram || "",
    linkSpotify: artista?.linkSpotify || "",
    linkBandcamp: artista?.linkBandcamp || "",
    linkWeb: artista?.linkWeb || "",
    linkYoutube: artista?.linkYoutube || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = artista
        ? `/api/admin/artistas/${artista.id}`
        : "/api/admin/artistas";
      const method = artista ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/admin/artistas");
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Error al guardar el artista");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar el artista");
    } finally {
      setLoading(false);
    }
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombre = e.target.value;
    setFormData({
      ...formData,
      nombre,
      slug: slugify(nombre, { lower: true, strict: true }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre y Slug */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Artista *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={handleNombreChange}
            required
            placeholder="Ej: La Mancha de Rolando"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            placeholder="la-mancha-de-rolando"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Biografía *</Label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe al artista..."
        />
      </div>

      {/* Ubicación */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad *</Label>
          <Input
            id="ciudad"
            value={formData.ciudad}
            onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
            required
            placeholder="Buenos Aires"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="provincia">Provincia</Label>
          <Input
            id="provincia"
            value={formData.provincia}
            onChange={(e) =>
              setFormData({ ...formData, provincia: e.target.value })
            }
            placeholder="Buenos Aires"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pais">País *</Label>
          <Input
            id="pais"
            value={formData.pais}
            onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Foto y Es Local */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="foto">URL de Foto</Label>
          <Input
            id="foto"
            type="url"
            value={formData.foto}
            onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="esLocal">¿Es artista local?</Label>
          <div className="flex items-center h-10">
            <input
              id="esLocal"
              type="checkbox"
              checked={formData.esLocal}
              onChange={(e) =>
                setFormData({ ...formData, esLocal: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="esLocal" className="ml-2 text-sm">
              Artista local de la zona
            </label>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Redes y Links</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="linkInstagram">Instagram</Label>
            <Input
              id="linkInstagram"
              type="url"
              value={formData.linkInstagram}
              onChange={(e) =>
                setFormData({ ...formData, linkInstagram: e.target.value })
              }
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkSpotify">Spotify</Label>
            <Input
              id="linkSpotify"
              type="url"
              value={formData.linkSpotify}
              onChange={(e) =>
                setFormData({ ...formData, linkSpotify: e.target.value })
              }
              placeholder="https://open.spotify.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkBandcamp">Bandcamp</Label>
            <Input
              id="linkBandcamp"
              type="url"
              value={formData.linkBandcamp}
              onChange={(e) =>
                setFormData({ ...formData, linkBandcamp: e.target.value })
              }
              placeholder="https://artista.bandcamp.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkYoutube">YouTube</Label>
            <Input
              id="linkYoutube"
              type="url"
              value={formData.linkYoutube}
              onChange={(e) =>
                setFormData({ ...formData, linkYoutube: e.target.value })
              }
              placeholder="https://youtube.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkWeb">Sitio Web</Label>
            <Input
              id="linkWeb"
              type="url"
              value={formData.linkWeb}
              onChange={(e) =>
                setFormData({ ...formData, linkWeb: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {artista ? "Guardar Cambios" : "Crear Artista"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
