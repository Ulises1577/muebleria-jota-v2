import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, Button, Card, Field, Icon, Input, PageHeader, Textarea } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks';
import { BRAND, WORKSHOP } from '../config/site';

const EMAIL_RE = /\S+@\S+\.\S+/;

/**
 * La API no tiene un endpoint de mensajes: el formulario valida y abre el correo del visitante
 * con el mensaje armado para el taller, así la consulta llega de verdad.
 */
export function ContactPage() {
  useDocumentTitle('Contacto');
  const { user } = useAuth();
  const location = useLocation();
  const [data, setData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    mensaje: location.state?.mensaje || ''
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setSent(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {};
    if (!data.nombre.trim()) next.nombre = 'Ingresá tu nombre.';
    if (!data.email.trim()) next.email = 'Ingresá tu email.';
    else if (!EMAIL_RE.test(data.email)) next.email = 'Ingresá un correo electrónico válido.';
    if (!data.mensaje.trim()) next.mensaje = 'Contanos qué estás buscando.';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    const subject = `Consulta de ${data.nombre.trim()} desde la web`;
    const body = `${data.mensaje.trim()}\n\n—\n${data.nombre.trim()}\n${data.email.trim()}`;
    window.location.href = `mailto:${WORKSHOP.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const details = [
    { icon: 'map-pin', label: 'Showroom y taller', value: `${WORKSHOP.street}, ${WORKSHOP.neighborhood}, ${WORKSHOP.cityShort}` },
    { icon: 'clock', label: 'Horario de atención', value: WORKSHOP.hours.map((slot) => slot.label).join(' · ') },
    { icon: 'phone', label: 'Teléfono directo', value: WORKSHOP.phone, href: `tel:${WORKSHOP.phone.replace(/[^+\d]/g, '')}` },
    { icon: 'mail', label: 'Correo electrónico', value: WORKSHOP.email, href: `mailto:${WORKSHOP.email}` }
  ];

  return (
    <div className="container store-page">
      <PageHeader
        eyebrow="Taller & atención al cliente"
        eyebrowIcon="store"
        title="Hablemos de tu próximo mueble"
        lead={`Cada pieza de ${BRAND.name} sale de un taller familiar, no de una línea de producción. Contanos qué estás buscando y te respondemos con la misma atención que le damos a cada tablón.`}
      />

      <div className="contact-layout">
        <Card as="aside" className="contact-info" aria-label="Información de contacto">
          <h2 className="section-title">Taller {BRAND.name}</h2>
          <p className="text-muted">Trabajamos con stock reducido de piezas listas y producción a medida. Contanos tu proyecto y te contamos los tiempos reales.</p>
          <dl className="contact-info__list">
            {details.map((item) => (
              <div key={item.label}>
                <span className="contact-info__icon" aria-hidden="true"><Icon name={item.icon} size={16} /></span>
                <div>
                  <dt>{item.label}</dt>
                  <dd>{item.href ? <a href={item.href}>{item.value}</a> : item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <form className="form-grid" onSubmit={handleSubmit} noValidate>
            {sent && (
              <Alert tone="success">
                Abrimos tu correo con el mensaje listo para enviar a {WORKSHOP.email}. Si no se abrió, escribinos directamente a esa dirección.
              </Alert>
            )}
            <div className="form-grid form-grid--2">
              <Field label="Nombre" htmlFor="contacto-nombre" error={errors.nombre}>
                <Input id="contacto-nombre" name="nombre" autoComplete="name" value={data.nombre} onChange={handleChange} invalid={Boolean(errors.nombre)} />
              </Field>
              <Field label="Email" htmlFor="contacto-email" error={errors.email}>
                <Input id="contacto-email" name="email" type="email" autoComplete="email" value={data.email} onChange={handleChange} invalid={Boolean(errors.email)} />
              </Field>
            </div>
            <Field label="Mensaje" htmlFor="contacto-mensaje" error={errors.mensaje}>
              <Textarea id="contacto-mensaje" name="mensaje" rows={6} value={data.mensaje} onChange={handleChange} invalid={Boolean(errors.mensaje)} />
            </Field>
            <div className="form-actions">
              <Button type="submit" size="lg" icon="mail">Enviar mensaje</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
