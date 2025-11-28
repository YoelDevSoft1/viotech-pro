import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container max-w-7xl mx-auto flex flex-col gap-8 py-12 px-4 sm:px-8 md:flex-row md:justify-between">
        <div className="space-y-4">
          <span className="text-lg font-bold">VioTech Solutions</span>
          <p className="text-sm text-muted-foreground max-w-xs">
            Desarrollo web minimalista y consultoría TI de alto impacto para empresas en crecimiento.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Producto</h4>
            <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground">Servicios</Link>
            <Link href="/services/catalog" className="text-sm text-muted-foreground hover:text-foreground">Catálogo</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Compañía</h4>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">Nosotros</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contacto</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Legal</h4>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacidad</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Términos</Link>
          </div>
        </div>
      </div>
      <div className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} VioTech Solutions. Todos los derechos reservados.
      </div>
    </footer>
  );
}