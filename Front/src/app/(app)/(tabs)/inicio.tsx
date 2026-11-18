// src/app/(app)/(tabs)/inicio.tsx
import { Button, Chips, EstadoVacio, HeaderApp, Input, Screen, ServicioCard, SkeletonCard, toast } from "@/components";
import { useAuthStore } from "@/context/authStore";
import { useServicios } from "@/hooks/useServicios";
import type { ServicioDto } from "@/types";
import { categoriaDe, FILTROS, normalizar, type FiltroCategoria } from "@/utils/categorias";
import { COLOR_BRAND } from "@/utils/theme";
import { Redirect } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

const Separador = () => <View className="h-3" />;

export default function Inicio() {
  const rol = useAuthStore((s) => s.usuario?.rol);

  if (rol === undefined) return null;
  if (rol !== "Cliente") return <Redirect href="/reservas" />;
  return <Catalogo />;
}

function Catalogo() {
  const { servicios, cargando, refrescando, error, refrescar, reintentar } = useServicios();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroCategoria>("Todos");

  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    return servicios.filter((s) => {
      const coincideCategoria = filtro === "Todos" || categoriaDe(s) === filtro;
      const coincideTexto =
        termino === "" || normalizar(`${s.nombreCategoria} ${s.descripcion}`).includes(termino);
      return coincideCategoria && coincideTexto;
    });
  }, [servicios, busqueda, filtro]);

  // TODO (siguiente paso): navegar a la pantalla de nueva reserva con el id del servicio.
  const solicitar = (servicio: ServicioDto): void => {
    toast.info(`Solicitar: ${servicio.nombreCategoria}`);
  };

  // Es un elemento, no una función-componente: así el campo de búsqueda no se
  // vuelve a montar (y pierde el foco) cada vez que se escribe una letra.
  const encabezado = (
    <View className="pb-3">
      <Input
        icono="search-outline"
        placeholder="Buscar servicios..."
        value={busqueda}
        onChangeText={setBusqueda}
        autoCorrect={false}
        returnKeyType="search"
      />
      <Text className="mb-2 mt-5 text-base font-bold text-gray-900">Categorías</Text>
      <Chips opciones={FILTROS} seleccionada={filtro} onChange={setFiltro} />
      <Text className="mb-1 mt-6 text-base font-bold text-gray-900">Servicios Populares</Text>
    </View>
  );

  const vacio = cargando ? (
    <View className="gap-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  ) : error !== null ? (
    <View>
      <EstadoVacio icono="cloud-offline-outline" titulo="No pudimos cargar los servicios" mensaje={error} />
      <Button titulo="Reintentar" variante="secundario" onPress={() => void reintentar()} />
    </View>
  ) : servicios.length === 0 ? (
    <EstadoVacio
      icono="albums-outline"
      titulo="Aún no hay servicios disponibles"
      mensaje="Vuelve a intentarlo más tarde."
    />
  ) : (
    <EstadoVacio
      icono="search-outline"
      titulo="No encontramos resultados"
      mensaje="Prueba con otra búsqueda o categoría."
    />
  );

  return (
    <Screen>
      <HeaderApp titulo="Bradson" tituloVerde mostrarMenu mostrarNotificacion />
      <FlatList
        data={cargando ? [] : filtrados}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item }) => <ServicioCard servicio={item} onSolicitar={solicitar} />}
        ItemSeparatorComponent={Separador}
        ListHeaderComponent={encabezado}
        ListEmptyComponent={vacio}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => void refrescar()} colors={[COLOR_BRAND]} />}
        contentContainerClassName="pb-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}