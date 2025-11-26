// Célula 1:

d3 = require("d3@6")

// Célula 2:

planets = [
  { name: "Mercúrio", color: "#b1b1b1", radius: 3, orbit: 58e6, period: 88 },
  { name: "Vênus", color: "#e0b55b", radius: 5, orbit: 108e6, period: 225 },
  { name: "Terra", color: "#4fa3ff", radius: 5, orbit: 150e6, period: 365 },
  { name: "Marte", color: "#d14f2b", radius: 4, orbit: 228e6, period: 687 },
  { name: "Júpiter", color: "#c79c5e", radius: 10, orbit: 778e6, period: 4333 },
  { name: "Saturno", color: "#e3d8a1", radius: 8, orbit: 1427e6, period: 10759 },
  { name: "Urano", color: "#9be8ff", radius: 7, orbit: 2871e6, period: 30687 },
  { name: "Netuno", color: "#4978ff", radius: 7, orbit: 4495e6, period: 60190 }
]

// Célula 3:

moons = [
  // Lua da Terra
  { name: "Lua", planet: "Terra", radius: 2, orbit: 384400, period: 27.3 },

  // Luas de Júpiter
  { name: "Io", planet: "Júpiter", radius: 2, orbit: 421700, period: 1.77 },
  { name: "Europa", planet: "Júpiter", radius: 2, orbit: 671100, period: 3.55 },
  { name: "Ganimedes", planet: "Júpiter", radius: 3, orbit: 1070400, period: 7.15 },
  { name: "Calisto", planet: "Júpiter", radius: 3, orbit: 1882700, period: 16.7 },

  // Lua de Saturno
  { name: "Titã", planet: "Saturno", radius: 3, orbit: 1221870, period: 15.9 }
]

// Célula 4

scale = d3.scaleLog()
    .domain([d3.min(planets, d => d.orbit), d3.max(planets, d => d.orbit)])
    .range([30, 300]) // Definimos um range mínimo (30px) para afastar Mercúrio do Sol, e um máximo (300px).

// Célula 5

moonScale = d3.scaleLog()
    .domain([1e5, 4e6]) // valores típicos da distância das luas
    .range([8, 25])     // tamanho visual das órbitas

// Célula 6

viewof solarSystem = {
  const width = 1160;
  const height = 700;
  const center = { x: width/2, y: height/2 };

  // Variáveis para gerenciar o estado da animação e o controle de tempo
  let isRunning = true; // Variável interna para controlar o estado (true = rodando, false = pausado)
  let pauseStart = 0; // Armazena o timestamp (rawElapsed) de quando a pausa começou
  let accumulatedPauseTime = 0; // O tempo total acumulado de todas as pausas
  let lastRawElapsed = 0; // Armazena o tempo bruto do último frame

  // Variável que gerencia a velocidade AGORA DENTRO desta célula
  let speed = 1; // Velocidade padrão

  // NOVO: Variável para rastrear o tempo total da animação de forma independente
  let animationTime = 0; 

  // 1. Crie o SVG e o container geral
  const container = document.createElement("div");
  container.style.position = "relative";
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#000033"); // Adiciona um fundo escuro para melhor visualização
  container.appendChild(svg.node());

  // === Fundo Estrelado ===
  const stars = d3.range(300).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.5
  }));

  svg.selectAll("circle.star")
    .data(stars)
    .join("circle")
    .attr("class", "star")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.r)
    .attr("fill", "white")
    .attr("opacity", 0.8);

  // 2. Crie o "botão" usando elementos SVG
  const buttonGroup = svg.append("g")
    .attr("transform", "translate(10, 660)") // Posiciona o botão no canto inferior esquerdo (ajuste conforme necessário)
    .style("cursor", "pointer") // Muda o cursor para indicar que é clicável
    .on("click", () => {
      isRunning = !isRunning; // Alterna o estado (Play/Pause)

      if(!isRunning){
        // Pausando: Registre o momento exato em que a pausa começou
        pauseStart = lastRawElapsed; 
        buttonText.text("Play");
      } else {
        // Retomando: Calcule a duração dessa última pausa e adicione ao total acumulado
        accumulatedPauseTime += lastRawElapsed - pauseStart;
        buttonText.text("Pause");
      } 
    });

  // Fundo do botão (retângulo)
  buttonGroup.append("rect")
    .attr("width", 55)
    .attr("height", 25)
    .attr("fill", "#555")
    .attr("rx", 5); // Cantos arredondados

  // Texto do botão
  const buttonText = buttonGroup.append("text")
    .attr("x", 27.5) // Centro X do retângulo
    .attr("y", 17) // Posição Y do texto (ajustado para centralizar verticalmente)
    .attr("fill", "white")
    .attr("text-anchor", "middle") // Centraliza o texto horizontalmente
    .attr("dominant-baseline", "middle") // Centraliza o texto verticalmente
    .style("font-size", "12px")
    .text("Pause"); // Texto inicial é "Pause" (pois está rodando)

  // === GRUPO RAIZ PARA TODO O SISTEMA SOLAR (Centralizado) ===
  // Movemos toda a renderização do sistema solar para dentro de um grupo centralizado, 
  // facilitando a gestão das coordenadas relativas.
  const systemGroup = svg.append("g")
    .attr("transform", `translate(${center.x},${center.y})`);

  // Desenha o Sol (agora relativo ao novo systemGroup no centro)
  systemGroup.append("circle")
    .attr("cx", 0) // Sol está na origem (0,0) do systemGroup
    .style("cursor", "pointer")
    .attr("cy", 0)
    .attr("r", 20)
    .attr("fill", "yellow")
    .append("title") // Adiciona o título/tooltip para o Sol
    .text("Sol");

  // === CORREÇÃO DO BUG: DESENHA AS ÓRBITAS SOLARES AQUI ===
  // Estas órbitas ficam estáticas no systemGroup, centradas no Sol.
  // 1. Desenha a órbita do planeta (centrada no Sol, que é a origem do systemGroup)
  systemGroup.selectAll("circle.orbit-sun")
    .data(planets)
    .join("circle")
    .attr("class", "orbit-sun")
    .attr("cx", 0) 
    .attr("cy", 0)
    .attr("r", d => scale(d.orbit))
    .attr("fill", "none")
    .attr("stroke", "rgba(255,255,255,0.2)")
    .attr("stroke-dasharray", "2,2");

  // === LUAS ===
  // Agrupa as luas por planeta (mantido para referência interna)
  const moonsByPlanet = d3.group(moons, d => d.planet);

  // --- SEÇÃO DE RENDERIZAÇÃO DE PLANETAS E LUAS ---
  // Cada planeta terá um grupo <g> para facilitar a rotação
  const planetGroups = systemGroup.selectAll("g.planet")
    .data(planets)
    .join("g")
    .attr("class", "planet");

    // === CORREÇÃO DO BUG: DESENHA AS ÓRBITAS DAS LUAS AQUI, DENTRO DO GRUPO DO PLANETA ===
    // Isso garante que o centro da órbita (cx=0, cy=0) esteja sempre no centro do planeta (origem do planetGroup).
    planetGroups.each(function(planetData){
      const planetGroup = d3.select(this);
      const planetMoons = moonsByPlanet.get(planetData.name);

      if (!planetMoons) return;

      // Desenha órbita da lua (centrada no planeta, que é a origem do planetGroup)
      planetGroup.selectAll("circle.orbit-moon") // Seleciona dentro do grupo do planeta
        .data(planetMoons)
        .join("circle")
        .attr("class", "orbit-moon")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", d => moonScale(d.orbit))
        .attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.15)")
        .attr("stroke-dasharray", "1,1"); // Órbitas de lua mais finas/tracejadas
    })
  
    planetGroups.each(function(planetData) {
      const planetGroup = d3.select(this);

      // 2. Adiciona o planeta (posição inicial na origem local, a animação fará a translação)
      planetGroup.append("circle")
        .attr("class", "planet-circle")
        .style("cursor", "pointer")
        .attr("r", d => d.radius)
        .attr("fill", d => d.color)
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("cx", 0) // Planeta fica na origem (0,0) do seu grupo
        .attr("cy", 0)
        .append("title")
        .text(d => d.name);

      // --- LUAS ---
      const planetMoons = moonsByPlanet.get(planetData.name);

      if (!planetMoons) return; // planeta sem luas → ignora

      // Cria grupo para as luas
      const moonGroups = planetGroup.selectAll("g.moon")
        .data(planetMoons)
        .join("g")
        .attr("class", "moon");

      // Desenha a lua (agora na origem local do seu próprio grupo, a translação virá na animação)
      moonGroups.append("circle")
        .attr("r", d => d.radius)
        .attr("fill", "white")
        .attr("cx", 0)
        .attr("cy", 0)
        .style("cursor", "pointer")
        .append("title")
        .text(d => d.name);
    });
    // Fim do bloco .each()

  // === ÍCONE DE ENGRENAGEM E MENU DE VELOCIDADE ===
  
  // Cria o menu flutuante (escondido inicialmente)
  const speedMenu = document.createElement("div");
  speedMenu.style.position = "absolute";
  speedMenu.style.bottom = "60px"; // Posição acima dos controles inferiores
  speedMenu.style.left = "10px";
  speedMenu.style.background = "#2a2a2a"; // Fundo escuro como na imagem
  speedMenu.style.padding = "15px";
  speedMenu.style.borderRadius = "8px";
  speedMenu.style.boxShadow = "0 4px 8px rgba(0,0,0,0.5)";
  speedMenu.style.display = "none"; // Esconde por padrão
  speedMenu.style.color = "white";
  speedMenu.style.width = "300px";
  speedMenu.innerHTML = `
    <strong>Velocidade da reprodução</strong>
    <hr style="border-color:#555;">
    <label for="speedSlider">Velocidade do tempo:</label>
    <!-- Adicionamos um input range e um input number manuais -->
    <input type="range" id="speedSlider" min="0.1" max="10" step="0.1" value="${speed}" style="width: 100%;">
    <input type="number" id="speedNumber" min="0.1" max="10" step="0.1" value="${speed}" style="width: 60px;">

    <div style="margin-top:10px;">
      Opções fixas:
      <!-- Atribuímos IDs e ouvintes de evento aqui -->
      <button id="btn-05x">0.5x</button>
      <button id="btn-1x">1x</button>
      <button id="btn-2x">2x</button>
    </div>
  `;
  container.appendChild(speedMenu);

  // Lógica para sincronizar os controles manuais
  const sliderInput = speedMenu.querySelector("#speedSlider");
  const numberInput = speedMenu.querySelector("#speedNumber");

  function updateSpeed(newSpeed) {
      speed = newSpeed;
      sliderInput.value = newSpeed;
      numberInput.value = newSpeed;
  }

  // Event Listeners para os novos inputs
  sliderInput.addEventListener("input", (e) => updateSpeed(parseFloat(e.target.value)));
  numberInput.addEventListener("input", (e) => updateSpeed(parseFloat(e.target.value)));

  // Event Listeners para os botões fixos
  speedMenu.querySelector("#btn-05x").addEventListener("click", () => updateSpeed(0.5));
  speedMenu.querySelector("#btn-1x").addEventListener("click", () => updateSpeed(1));
  speedMenu.querySelector("#btn-2x").addEventListener("click", () => updateSpeed(2));

  // Ícone de Engrenagem (Settings) - SVG para melhor visual
  const settingsIcon = svg.append("g")
    .attr("transform", "translate(80, 660)") // Posição próxima ao botão Play/Pause
    .style("cursor", "pointer")
    .on("click", (event) => {
      // Impede que o clique no ícone se propague e feche o menu imediatamente
      event.stopPropagation(); 
      speedMenu.style.display = (speedMenu.style.display === "none") ? "block" : "none";
    });

  // Desenho do ícone de engrenagem simplificado (use um SVG path real para um ícone melhor)
  settingsIcon.append("rect")
    .attr("width", 30)
    .attr("height", 25)
    .attr("fill", "#555")
    .attr("rx", 5);
  settingsIcon.append("text")
    .attr("x", 15)
    .attr("y", 17)
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "18px")
    .text("⚙︎"); // Engrenagem unicode simples

  // --- LÓGICA DE ANIMAÇÃO CORRIGIDA ---

  // Precisamos rastrear o tempo decorrido no frame anterior para calcular o delta
  let lastFrameTime = performance.now();
  
  let timer = d3.timer(rawElapsed => {
    // Sempre atualize o último tempo bruto conhecido, para uso no clique
    lastRawElapsed = rawElapsed;

    // Calcula o tempo Delta entre o frame atual e o anterior
    const currentFrameTime = performance.now();
    const deltaTime = currentFrameTime - lastFrameTime;
    lastFrameTime = currentFrameTime;

    if (isRunning) {
      // Incrementa o tempo da animação usando o delta time MULTIPLICADO pela velocidade
      // Isso garante um movimento suave, independente do tempo total
      animationTime += deltaTime * speed;
      
      // Animação dos planetas: 
      // 1. Calcula o ângulo de rotação em torno do Sol.
      // 2. Aplica a transformação: rotaciona em torno da origem (Sol) E move o grupo para a distância orbital (translateX).
      // o tempo corrigido (effectiveElapsed)
      planetGroups.attr("transform", d => {
        // === velocidade controlada pelo slider ===
        const angle = (animationTime / (d.period * 100)) * 2 * Math.PI; // Ajuste de escala de tempo (2000ms base)
        const orbitRadius = scale(d.orbit);
        // CORREÇÃO: Rotaciona primeiro em torno do Sol (origem), depois translada para a distância orbital.
        return `rotate(${angle * 180 / Math.PI}) translate(${orbitRadius}, 0)`;
      });

      // Animação das luas (relativa ao seu planeta pai):
      // 1. Pega cada grupo de planeta.
      // 2. Aplica transformação *apenas de rotação* nos grupos das luas. 
      //    A translação da lua já está configurada para a distância correta em relação ao planeta.
      //    A herança de transformações faz com que elas girem junto com o planeta em torno do sol, 
      //    e agora girem em torno do planeta devido a essa nova rotação local.
      planetGroups.each(function(planetData) {
        const planetMoons = moonsByPlanet.get(planetData.name);
        if (!planetMoons) return;
      
        const moonGroups = d3.select(this).selectAll("g.moon");
      
        moonGroups.attr("transform", d => {
          const moonAngle = (animationTime / (d.period * 50)) * 2 * Math.PI; // Ajuste de escala de tempo (1000ms base)
          const moonOrbitRadius = moonScale(d.orbit);
          // CORREÇÃO: Rotaciona primeiro em torno do Planeta (origem local), depois translada para a distância orbital.
          return `rotate(${moonAngle * 180 / Math.PI}) translate(${moonOrbitRadius}, 0)`;
        });
      });
    }
    // Se estiver pausado, o loop simplesmente não faz nada dentro do 'if', 
    // e o accumulatedPauseTime é ajustado no próximo clique em "Play".
  });

  // Limpeza no Observable
  invalidation.then(() => timer.stop());

  // Adiciona um listener global para fechar o menu se o usuário clicar fora dele
  document.addEventListener("click", (event) => {
    // Verifica se o clique foi fora do menu e fora do ícone de engrenagem
    if (!speedMenu.contains(event.target) && !settingsIcon.node().contains(event.target)) {
      speedMenu.style.display = "none";
    }
  });

  return container;
}
