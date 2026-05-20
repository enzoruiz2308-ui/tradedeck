# DTO de entrada
def dto_entrada_anuncio(datos):
    errores = []
    if not datos.get("tipo") or datos["tipo"] not in ["venta", "compra"]:
        errores.append("El tipo debe ser 'venta' o 'compra'")
    if not datos.get("juego") or datos["juego"] not in ["pokemon", "onepiece"]:
        errores.append("El juego debe ser 'pokemon' o 'onepiece'")
    if not datos.get("nombre_carta"):
        errores.append("El nombre de la carta es obligatorio")
    if not datos.get("precio") or datos["precio"] <= 0:
        errores.append("El precio debe ser mayor que 0")
    return errores

# DTO de salida
def dto_salida_anuncio(anuncio):
    return {
        "id": anuncio.id,
        "tipo": anuncio.tipo,
        "juego": anuncio.juego,
        "nombre_carta": anuncio.nombre_carta,
        "precio": anuncio.precio,
        "descripcion": anuncio.descripcion,
        "usuario_id": anuncio.usuario_id
    }