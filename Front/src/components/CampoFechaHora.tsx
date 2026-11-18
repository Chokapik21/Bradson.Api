// src/components/CampoFechaHora.tsx
import { formatearFecha, formatearHora } from "@/utils/fechas";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform } from "react-native";
import { AppModal } from "./AppModal";
import { Button } from "./Button";
import { CampoSeleccion } from "./CampoSeleccion";

interface CampoFechaHoraProps {
  modo: "date" | "time";
  valor: Date | undefined;
  onChange: (valor: Date) => void;
  minimumDate?: Date;
  error?: string;
}

export function CampoFechaHora({ modo, valor, onChange, minimumDate, error }: CampoFechaHoraProps) {
  const [iosVisible, setIosVisible] = useState(false);
  const [iosTemporal, setIosTemporal] = useState<Date>(new Date());

  const abrir = (): void => {
    const base = valor ?? new Date();
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: base,
        mode: modo,
        minimumDate,
        is24Hour: false,
        onChange: (evento, seleccionada) => {
          if (evento.type === "set" && seleccionada !== undefined) onChange(seleccionada);
        },
      });
      return;
    }
    setIosTemporal(base);
    setIosVisible(true);
  };

  const texto = valor === undefined ? null : modo === "date" ? formatearFecha(valor) : formatearHora(valor);

  return (
    <>
      <CampoSeleccion
        icono={modo === "date" ? "calendar-outline" : "time-outline"}
        valor={texto}
        placeholder={modo === "date" ? "dd/mm/aaaa" : "--:--"}
        onPress={abrir}
        error={error}
      />
      {Platform.OS === "ios" ? (
        <AppModal
          visible={iosVisible}
          titulo={modo === "date" ? "Elige la fecha" : "Elige la hora"}
          onClose={() => setIosVisible(false)}
        >
          <DateTimePicker
            value={iosTemporal}
            mode={modo}
            display="spinner"
            minimumDate={minimumDate}
            onChange={(_, d) => {
              if (d !== undefined) setIosTemporal(d);
            }}
          />
          <Button
            titulo="Listo"
            onPress={() => {
              onChange(iosTemporal);
              setIosVisible(false);
            }}
          />
        </AppModal>
      ) : null}
    </>
  );
}