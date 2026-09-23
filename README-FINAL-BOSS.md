# Atualização — Boss Final 750 HP

O Boss Final da Fase 9 agora possui um sistema de combate próprio.

## Visual
- Não usa apenas o mesmo desenho dos outros Bosses.
- Corpo alienígena/tecnológico desenhado no Canvas.
- Núcleo pulsante e anéis de energia.
- Módulos laterais e iluminação neon.
- O visual muda conforme a vida cai: ciano → roxo → magenta/vermelho.
- A barra de vida também acompanha a fase do combate.

## Fases de ataque
### 750–501 HP — Protocolo 1
- Movimento horizontal moderado.
- Tiros direcionados para a posição atual da nave.

### 500–251 HP — Protocolo 2
- Movimento mais rápido.
- Leque de 5 projéteis.
- Tiros direcionados alternados.

### 250–0 HP — Protocolo 3
- Movimento mais rápido.
- Leque de 7 projéteis.
- Tiros direcionados frequentes.
- Ataque especial aparece com maior frequência.

## Ataque especial — Raio de Energia
1. Uma faixa vertical aparece no cenário.
2. A área pisca e mostra `⚠ RAIO DE ENERGIA`.
3. O jogador tem alguns frames para sair da zona.
4. O raio é disparado e ocupa toda a altura da arena por poucos frames.
5. A colisão tira uma vida, respeitando o sistema de invulnerabilidade/escudo.

O ataque especial é telegráfico de propósito: o jogador consegue perceber o perigo e reagir usando teclado ou arrastando a nave no celular.

## Compatibilidade preservada
- Canvas 500×600.
- W/A/S/D + setas + Espaço.
- Arrastar no celular movimenta a nave e mantém tiro automático enquanto o dedo estiver pressionado.
- Quiz e escolha de poderes.
- Poderes temporários e fixos para Boss.
- Ranking Firebase/Firestore.
- Pontuação e bônus de tempo.
- Campanha de 9 etapas.


## Ajuste V10
- Boss da Fase 6 voltou a ser o Boss 2 comum (500 HP).
- O Boss Final com raio de energia fica somente na Fase 9 (Boss 3).
- Projéteis das fases 2 e 3 do Boss Final foram desacelerados para melhorar a possibilidade de desvio.
