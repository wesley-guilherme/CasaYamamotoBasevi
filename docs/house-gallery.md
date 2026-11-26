# Fotografias dos ambientes da casa

O script `scripts/optimize-house-gallery.py` gera cópias WebP diretamente dos originais. A pasta de origem é somente leitura para o processo: as fotos não são substituídas nem recomprimidas no local de origem.

```text
python scripts/optimize-house-gallery.py "<pasta-dos-originais>" public/images/casa app/a-casa/gallery-manifest.json
```

A conversão respeita a orientação EXIF e transforma o perfil ICC original, inclusive ROMM/ProPhoto RGB, em sRGB antes da compressão. Cada cópia recebe o perfil sRGB para manter a aparência das cores nos navegadores. Nenhuma versão recebe cortes ou ampliação artificial.

O manifesto JSON associa cada ambiente às fotografias. Em cada foto, `sources` contém caminhos públicos, larguras e alturas reais das versões de 480, 800, 1200 e 1600 pixels de largura, quando menores que a versão ampliada. A versão `full` limita o lado maior a 3200 pixels; fotos menores conservam sua resolução máxima disponível. As versões comuns usam qualidade WebP 85 e a ampliada usa 87. Esses valores são parâmetros do codificador, não percentuais de preservação da qualidade.

`thumb`, `thumbWidth` e `thumbHeight` identificam a menor versão de cada foto. `full`, `width` e `height` identificam a maior. Os nomes incluem um resumo do conteúdo para impedir que o cache reutilize uma versão anterior após nova conversão.

A galeria e a foto de abertura usam `srcSet` e `sizes`. O navegador escolhe uma única resolução considerando o espaço disponível e a densidade da tela. Nos cartões, o cálculo também considera a altura e o enquadramento de `object-fit: cover`; na ampliação, considera a proporção da fotografia e a altura disponível. O CSS, as proporções dos cartões e a exibição da fotografia inteira na ampliação permanecem como no desenho existente.

As versões antigas com nomes `-thumb.webp` e `-full.webp` ainda são usadas por outras páginas e devem ser preservadas enquanto houver referências a elas. Os originais de vários megabytes não são enviados ao visitante.
