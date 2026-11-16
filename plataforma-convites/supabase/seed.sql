-- Seed de desenvolvimento: categorias exigidas e modelos de demonstração do catálogo.
-- Não contém dados de clientes. Em produção, modelos são cadastrados pelo painel admin.
-- Personagens são ORIGINAIS da loja; não usar personagens licenciados sem contrato de licença.

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
  ('animado', 'Animado'), ('floral', 'Floral'), ('minimalista', 'Minimalista'),
  ('classico', 'Clássico'), ('noturno', 'Noturno')
on conflict (slug) do nothing;

do $$
declare
  t_id uuid; v_id uuid;
  rec record;
  palettes text[];
begin
  for rec in
    select * from (values
      -- Animados (personagens próprios com movimento)
      ('ursinho-festeiro', 'Ursinho Festeiro', 'aniversario-infantil', 'animado', 'Animado', 2990, true,
       'Um ursinho de chapéu de festa acenando para os convidados num céu cheio de nuvens.',
       '{"variant":"animado","character":"urso","scene":"ceu"}', array['rsvp','mapa','animacao','contagem_regressiva']),
      ('dino-aventura', 'Dino Aventura', 'aniversario-infantil', 'animado', 'Animado', 2990, true,
       'Dinossauro sorridente dando tchau no meio da selva, com folhas balançando.',
       '{"variant":"animado","character":"dino","scene":"selva"}', array['rsvp','mapa','animacao']),
      ('astronauta-espacial', 'Astronauta Espacial', 'aniversario-infantil', 'animado', 'Animado', 3490, true,
       'Viagem ao espaço com estrelas piscando, planeta flutuando e astronauta acenando.',
       '{"variant":"animado","character":"astronauta","scene":"espaco"}', array['rsvp','mapa','animacao','links_individuais']),
      ('safari-do-leao', 'Safári do Leão', 'aniversario-infantil', 'animado', 'Animado', 2990, false,
       'Leãozinho de juba fofa recebendo a turma para uma festa na selva.',
       '{"variant":"animado","character":"leao","scene":"selva"}', array['rsvp','mapa','animacao']),
      ('coelhinha-doce', 'Coelhinha Doce', 'aniversario-infantil', 'animado', 'Fofo', 2990, true,
       'Coelhinha de laço mexendo a orelhinha num cenário de confeitaria.',
       '{"variant":"animado","character":"coelha","scene":"doce"}', array['rsvp','mapa','animacao']),
      ('baleia-azul', 'Baleia Azul', 'cha-de-bebe', 'animado', 'Fofo', 2990, true,
       'Baleinha soltando jatinhos de água no fundo do mar, com bolhas subindo.',
       '{"variant":"animado","character":"baleia","scene":"mar"}', array['rsvp','mapa','animacao','lista_de_presentes']),
      ('ursinho-nas-nuvens', 'Ursinho nas Nuvens', 'cha-de-bebe', 'animado', 'Fofo', 2990, false,
       'Ursinho acenando entre nuvens para um chá de bebê cheio de carinho.',
       '{"variant":"animado","character":"urso","scene":"doce"}', array['rsvp','mapa','animacao','lista_de_presentes']),
      ('caixa-surpresa', 'Caixa Surpresa', 'cha-revelacao', 'animado', 'Vibrante', 3490, true,
       'Confete caindo e balões coloridos para o grande momento da revelação.',
       '{"variant":"animado","character":"baloes","scene":"festa"}', array['rsvp','mapa','animacao','contagem_regressiva']),
      ('festa-colorida', 'Festa Colorida', 'aniversario-adulto', 'animado', 'Vibrante', 2990, false,
       'Chuva de confete e balões para uma festa animada em qualquer idade.',
       '{"variant":"animado","character":"baloes","scene":"festa"}', array['rsvp','mapa','animacao']),
      ('batizado-celeste', 'Céu de Batizado', 'batizado', 'animado', 'Suave', 2990, false,
       'Céu azul com nuvens passeando e um ursinho dando as boas-vindas.',
       '{"variant":"animado","character":"urso","scene":"ceu"}', array['rsvp','mapa','animacao']),
      ('encontro-livre', 'Encontro Livre', 'outros', 'animado', 'Moderno', 2990, false,
       'Um convite alegre e versátil para qualquer ocasião.',
       '{"variant":"animado","character":"baloes","scene":"ceu"}', array['rsvp','animacao']),
      -- Clássicos (para quem prefere elegância)
      ('papel-fino', 'Papel Fino', 'casamento', 'classico', 'Editorial', 4990, true,
       'Tipografia serifada, margens generosas e programação de cerimônia e recepção.',
       '{"variant":"editorial"}', array['rsvp','mapa','links_individuais','lista_de_presentes','contagem_regressiva']),
      ('linho-e-salvia', 'Linho & Sálvia', 'casamento', 'floral', 'Delicado', 5990, false,
       'Folhagens em sálvia e papel de linho para celebrações ao ar livre.',
       '{"variant":"botanico"}', array['rsvp','mapa','links_individuais','lista_de_presentes']),
      ('lua-de-algodao', 'Lua de Algodão', 'cha-de-bebe', 'minimalista', 'Suave', 2990, false,
       'Tons pastel, lua e estrelas para um chá de bebê acolhedor.',
       '{"variant":"celeste"}', array['rsvp','mapa','lista_de_presentes']),
      ('noite-de-gala', 'Noite de Gala', '15-anos', 'noturno', 'Sofisticado', 3990, true,
       'Fundo profundo, detalhes champagne e contagem regressiva.',
       '{"variant":"gala"}', array['rsvp','mapa','links_individuais','contagem_regressiva']),
      ('capelo', 'Capelo', 'formatura', 'noturno', 'Sofisticado', 3490, false,
       'Visual noturno com acentos dourados para colações e bailes.',
       '{"variant":"gala"}', array['rsvp','mapa','links_individuais']),
      ('agenda-executiva', 'Agenda Executiva', 'corporativo', 'minimalista', 'Editorial', 4990, false,
       'Grade limpa com programação e orientações de participação.',
       '{"variant":"minimal"}', array['rsvp','mapa','links_individuais','programacao']),
      ('ceia-em-familia', 'Ceia em Família', 'datas-comemorativas', 'classico', 'Acolhedor', 2990, false,
       'Para ceias, confraternizações e datas especiais.',
       '{"variant":"editorial"}', array['rsvp','mapa'])
    ) as x(slug, name, cat, theme, style, price, featured, descr, layout, feats)
  loop
    insert into public.templates (slug, name, description, category_id, theme_id, style, status, is_featured)
    values (rec.slug, rec.name, rec.descr,
            (select id from public.categories where slug = rec.cat),
            (select id from public.themes where slug = rec.theme),
            rec.style, 'published', rec.featured)
    on conflict (slug) do nothing
    returning id into t_id;
    continue when t_id is null;

    palettes := case when rec.layout::jsonb ->> 'variant' = 'animado'
                     then array['rosa','azul','roxo','verde','laranja']
                     else array['champagne','salvia','rose'] end;

    insert into public.template_versions (template_id, version, price_cents, layout, style_options, features)
    values (t_id, 1, rec.price, rec.layout::jsonb,
            jsonb_build_object('palettes', to_jsonb(palettes)), rec.feats)
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
      (v_id, 'palette', 'color', 'Cor de destaque', 'estilo', false, null, jsonb_build_object('choices', to_jsonb(palettes)), 15);

    update public.template_versions set published_at = now() where id = v_id;
    update public.templates set current_version_id = v_id where id = t_id;
  end loop;
end $$;
