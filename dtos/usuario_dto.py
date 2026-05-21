# DTO de entrada — lo que el cliente manda al crear usuario
def dto_entrada_usuario(datos):
    errores = []
    if not datos.get("nombre"):
        errores.append("El nombre es obligatorio")
    if not datos.get("email"):
        errores.append("El email es obligatorio")
    if not datos.get("password"):
        errores.append("La contraseña es obligatoria")
    return errores

# DTO de salida — lo que devolvemos (nunca la contraseña)
def dto_salida_usuario(usuario):
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "fecha_alta": str(usuario.fecha_alta)
    }