-- Seed de desenvolvimento: categorias exigidas e modelos de demonstração do catálogo.
-- Não contém dados de clientes. Em produção, modelos são cadastrados pelo painel admin.

insert into public.categories (slug, name, sort_order) values
  ('aniversario-infantil', 'Aniversário infantil', 1),
  ('aniversario-adulto', 'Aniversário adulto', 2),
  ('casamento', 'Casamento', 3),
  ('cha-de-bebe', 'Chá de bebê', 4),
  ('cha-revelacao', 'Chá revelação', 5),
  ('batizado', 'Batizado', 6),
  ('formatura', 'Formatura', 7),
  ('15-anos', '15 anos', 8),
  ('corporativo', 'Eventos corporativos', 9),
  ('datas-comemorativas', 'Datas comemorativas', 10),
  ('outros', 'Outros eventos', 11)
on conflict (slug) do nothing;

insert into public.themes (slug, name) values
  ('floral', 'Floral'), ('minimalista', 'Minimalista'), ('ludico', 'Lúdico'),
  ('classico', 'Clássico'), ('noturno', 'Noturno')
on conflict (slug) do nothing;

do $$
declare
  t_id uuid; v_id uuid;
  rec record;
begin
  for rec in
    select * from (values
      ('jardim-encantado', 'Jardim Encantado', 'aniversario-infantil', 'floral', 'Delicado', 4900, true,
       'Ilustrações botânicas suaves e confirmação de presença integrada.', 'botanico', array['rsvp','mapa','contagem_regressiva']),
      ('papel-fino', 'Papel Fino', 'casamento', 'classico', 'Editorial', 8900, true,
       'Tipografia serifada, margens generosas e programação de cerimônia e recepção.', 'editorial', array['rsvp','mapa','links_individuais','lista_de_presentes','contagem_regressiva']),
      ('lua-de-algodao', 'Lua de Algodão', 'cha-de-bebe', 'minimalista', 'Suave', 5900, true,
       'Tons pastel, lua e estrelas para um chá de bebê acolhedor.', 'celeste', array['rsvp','mapa','lista_de_presentes']),
      ('caixa-surpresa', 'Caixa Surpresa', 'cha-revelacao', 'ludico', 'Vibrante', 5900, false,
       'Confete e contraste para o grande momento da revelação.', 'confete', array['rsvp','mapa','contagem_regressiva']),
      ('noite-de-gala', 'Noite de Gala', '15-anos', 'noturno', 'Sofisticado', 7900, true,
       'Fundo profundo, detalhes champagne e contagem regressiva.', 'gala', array['rsvp','mapa','links_individuais','contagem_regressiva']),
      ('linho-e-salvia', 'Linho & Sálvia', 'casamento', 'floral', 'Delicado', 9900, false,
       'Folhagens em sálvia e papel de linho para celebrações ao ar livre.', 'botanico', array['rsvp','mapa','links_individuais','lista_de_presentes']),
      ('brinde-de-ouro', 'Brinde de Ouro', 'aniversario-adulto', 'classico', 'Elegante', 5900, false,
       'Detalhes dourados e composição centrada para aniversários marcantes.', 'editorial', array['rsvp','mapa']),
      ('luz-serena', 'Luz Serena', 'batizado', 'minimalista', 'Suave', 4900, false,
       'Composição leve e serena para um batizado em família.', 'celeste', array['rsvp','mapa']),
      ('capelo', 'Capelo', 'formatura', 'noturno', 'Sofisticado', 6900, false,
       'Visual noturno com acentos champagne para colações e bailes.', 'gala', array['rsvp','mapa','links_individuais']),
      ('agenda-executiva', 'Agenda Executiva', 'corporativo', 'minimalista', 'Editorial', 12900, false,
       'Grade limpa com programação e orientações de participação.', 'minimal', array['rsvp','mapa','links_individuais','programacao']),
      ('ceia-em-familia', 'Ceia em Família', 'datas-comemorativas', 'classico', 'Acolhedor', 3900, false,
       'Para ceias, confraternizações e datas especiais.', 'editorial', array['rsvp','mapa']),
      ('encontro-livre', 'Encontro Livre', 'outros', 'minimalista', 'Moderno', 3900, false,
       'Um convite versátil para qualquer ocasião.', 'minimal', array['rsvp'])
    ) as x(slug, name, cat, theme, style, price, featured, descr, variant, feats)
  loop
    insert into public.templates (slug, name, description, category_id, theme_id, style, status, is_featured)
    values (rec.slug, rec.name, rec.descr,
            (select id from public.categories where slug = rec.cat),
            (select id from public.themes where slug = rec.theme),
            rec.style, 'published', rec.featured)
    on conflict (slug) do nothing
    returning id into t_id;
    continue when t_id is null;

    insert into public.template_versions (template_id, version, price_cents, layout, style_options, features)
    values (t_id, 1, rec.price,
            jsonb_build_object('variant', rec.variant),
            '{"palettes":["champagne","salvia","rose"],"fonts":["cormorant","inter"]}',
            rec.feats)
    returning id into v_id;

    insert into public.template_fields (template_version_id, key, type, label, step, required, max_length, options, sort_order) values
      (v_id, 'honoree_name', 'text', 'Nome do homenageado ou responsáveis', 'basico', true, 80, '{}', 1),
      (v_id, 'title', 'text', 'Título do evento', 'basico', true, 100, '{}', 2),
      (v_id, 'age', 'number', 'Idade', 'basico', false, null, '{"min":0,"max":120}', 3),
      (v_id, 'event_date', 'date', 'Data', 'quando', true, null, '{}', 4),
      (v_id, 'event_time', 'time', 'Horário', 'quando', true, null, '{}', 5),
      (v_id, 'timezone', 'timezone', 'Fuso horário', 'quando', true, null, '{}', 6),
      (v_id, 'venue_name', 'text', 'Nome do local', 'onde', true, 100, '{}', 7),
      (v_id, 'address', 'text', 'Endereço', 'onde', true, 160, '{}', 8),
      (v_id, 'address_extra', 'text', 'Complemento', 'onde', false, 80, '{}', 9),
      (v_id, 'map_url', 'url', 'Link de localização', 'onde', false, 500, '{}', 10),
      (v_id, 'message', 'textarea', 'Mensagem personalizada', 'mensagem', false, 600, '{}', 11),
      (v_id, 'rsvp_deadline', 'date', 'Data-limite para confirmação', 'confirmacao', false, null, '{}', 12),
      (v_id, 'max_companions', 'number', 'Máximo de acompanhantes por convidado', 'confirmacao', false, null, '{"min":0,"max":20}', 13),
      (v_id, 'extra_info', 'textarea', 'Informações adicionais', 'mensagem', false, 400, '{}', 14),
      (v_id, 'palette', 'color', 'Paleta', 'estilo', false, null, '{"choices":["champagne","salvia","rose"]}', 15),
      (v_id, 'font', 'font', 'Tipografia', 'estilo', false, null, '{"choices":["cormorant","inter"]}', 16);

    update public.template_versions set published_at = now() where id = v_id;
    update public.templates set current_version_id = v_id where id = t_id;
  end loop;
end $$;
