// Célula 01: [Importação do D3] ==============================================================

d3 = require("d3@6")

// Célula 02: [Planetas] ======================================================================

planets = [
  { name: "Mercúrio", color: "#b1b1b1", radius: 3, realRadius: 2439, orbit: 58e6, a_AU: 0.387, period: 88, mass: 0.330, img: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg", e: 0.2056, i: 7.00, p_arg: 252.25 },
  { name: "Vênus", color: "#e0b55b", radius: 5, realRadius: 6051, orbit: 108e6, a_AU: 0.723, period: 225, mass: 4.87, img: "https://upload.wikimedia.org/wikipedia/commons/0/08/Venus_from_Mariner_10.jpg", e: 0.0068, i: 3.39, p_arg: 181.98 },
  { name: "Terra", color: "#4fa3ff", radius: 5, realRadius: 6371, orbit: 150e6, a_AU: 1.000, period: 365, mass: 5.97, img: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg", e: 0.0167, i: 0.00, p_arg: 102.95 },
  { name: "Marte", color: "#d14f2b", radius: 4, realRadius: 3389, orbit: 228e6, a_AU: 1.524, period: 687, mass: 0.642, img: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg", e: 0.0934, i: 1.85, p_arg: 336.04 },
  { name: "Júpiter", color: "#c79c5e", radius: 10, realRadius: 69911, orbit: 778e6, a_AU: 5.203, period: 4333, mass: 1898, img: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg", e: 0.0484, i: 1.31, p_arg: 14.75 }, 
  { name: "Saturno", color: "#e3d8a1", radius: 8, realRadius: 58232, orbit: 1427e6, a_AU: 9.537, period: 10759, mass: 568, img: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg", e: 0.0542, i: 2.48, p_arg: 92.59 },
  { name: "Urano", color: "#9be8ff", radius: 7, realRadius: 25362, orbit: 2871e6, a_AU: 19.191, period: 30687, mass: 86.8, img: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg", e: 0.0472, i: 0.77, p_arg: 170.96 },
  { name: "Netuno", color: "#4978ff", radius: 7, realRadius: 24622, orbit: 4495e6, a_AU: 30.069, period: 60190, mass: 102, img: "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg", e: 0.0086, i: 1.77, p_arg: 44.97 }
];

// Célula 03: [Luas] ==========================================================================

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

// Célula 04: [Escala das orbitas dos planetas e das luas] ====================================
scaleOrbits = {
  // Usamos um domínio fixo e robusto que cobre todos os planetas (em KM, de Mercúrio a Netuno)
  const minOrbitKM = 5e7; // ~50 milhões km (Mercúrio)
  const maxOrbitKM = 4.5e9; // ~4.5 bilhões km (Netuno)
  
  const planetScale = d3.scaleLog()
    .domain([minOrbitKM, maxOrbitKM])
    .range([30, 300]); // Definimos um range mínimo (30px) para afastar Mercúrio do Sol, e um máximo (300px).

  const moonScale = d3.scaleLog()
    .domain([1e5, 4e6]) // valores típicos da distância das luas
    .range([8, 25]);     // tamanho visual das órbitas

  return { planetScale, moonScale };
}

// Célula 5: [Variáveis de estado da animação] ================================================

// Célula 05.1: [Controle de reprodução (play/pause)] =========================================

mutable isRunning = true;

// Célula 05.2: [Timestamp do início da pausa] ================================================

mutable pauseStart = 0;

// Célula 05.3: [Soma de pausas anteriores] ===================================================

mutable accumulatedPauseTime = 0;

// Célula 06: [Container e dimensões] =========================================================

containerAndDimensions = {
  // === Dimensões e ponto central da cena ===
  const width = 1160;
  const height = 700;
  const center = { x: width/2, y: height/2 };

  return { width, height, center };
}

// Célula 07: [Criação do Container + SVG] ====================================================

// === Container principal ===
makeContainerCell = function(width, height) {
  const container = document.createElement("div");
  container.style.position = "relative";

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#000033") // Adiciona um fundo escuro
    .node()

  container.appendChild(svg);

  return { container, svg: d3.select(svg) };
}

// Célula 08: [Fundo Estrelado] ===============================================================

// === Fundo Estrelado ===
makeStarfield = function(svg, width, height, n = 300) {
  const stars = d3.range(n).map(() => ({
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

  return { stars, svg }
}

// Célula 09: [Botão Play/Pause] ==============================================================

// === Botão Play/Pause ===
makePlayPauseButton = function(svg, onToggle) {
  const group = svg.append("g")
    .attr("transform", "translate(10, 660)") // Posiciona o botão no canto inferior esquerdo (ajuste conforme necessário)
    .style("cursor", "pointer")
    .on("click", onToggle);

  // Fundo e texto do botão
  group.append("rect")
    .attr("width", 55)
    .attr("height", 25)
    .attr("fill", "#555")
    .attr("rx", 5); // Cantos arredondados

  const text = group.append("text")
    .attr("x", 27.5) // Centro X do retângulo
    .attr("y", 17) // Posição Y do texto (ajustado para centralizar verticalmente)
    .attr("fill", "white")
    .attr("text-anchor", "middle") // Centraliza o texto horizontalmente
    .attr("dominant-baseline", "middle") // Centraliza o texto verticalmente
    .style("font-size", "12px")
    .text("Pause");                            // Texto inicial é "Pause" (pois está rodando)

  return { group, text };
}

// Célula 10: [Menu de Velocidade] ============================================================

// Célula 10.1: [Variável de Velocidade] ======================================================

mutable speed = 1;

// Célula 10.2: [Controles] ===================================================================

// === Menu de Velocidade (Engrenagem + Controles) ===
makeSpeedMenu = function(container, svg) {
  
  // === Menu flutuante (inicialmente oculto) ===
  const speedMenu = document.createElement("div");
  speedMenu.style.position = "absolute";
  speedMenu.style.bottom = "60px"; // Acima dos controles inferiores
  speedMenu.style.left = "10px";
  speedMenu.style.background = "#2a2a2a"; // Estilo painel escuro
  speedMenu.style.padding = "15px";
  speedMenu.style.borderRadius = "8px";
  speedMenu.style.boxShadow = "0 4px 8px rgba(0,0,0,0.5)";
  speedMenu.style.display = "none";
  speedMenu.style.color = "white";
  speedMenu.style.width = "300px";

  // Estrutura interna do menu
  speedMenu.innerHTML = `
    <strong>Velocidade da reprodução</strong>
    <hr style="border-color:#555;">

    <label for="speedSlider">Velocidade:</label>

    <!-- Controles principais -->
    <input type="range" id="speedSlider" min="0.1" max="10" step="0.1" value="${mutable speed}" style="width: 100%;">
    <input type="number" id="speedNumber" min="0.1" max="10" step="0.1" value="${mutable speed}" style="width: 60px;">

    <!-- Atalhos rápidos -->
    <div style="margin-top:10px;">
      Opções fixas:
      <button id="btn-05x">0.5x</button>
      <button id="btn-1x">1x</button>
      <button id="btn-2x">2x</button>
    </div>
  `;

  container.appendChild(speedMenu);

  // === Sincronização dos controles de velocidade ===
  const sliderInput = speedMenu.querySelector("#speedSlider");
  const numberInput = speedMenu.querySelector("#speedNumber");

  // Atualiza velocidade e sincroniza campos
  const updateSpeed = (newSpeed) => {

      // Verifica se o novo valor é um número válido, senão usa 1 como padrão
      const validatedSpeed = isNaN(newSpeed) || newSpeed === 0 ? 1 : newSpeed;
    
      // Altera a variável 'mutable'
      mutable speed = validatedSpeed; 
      sliderInput.value = validatedSpeed;
      numberInput.value = validatedSpeed;
  };

  // Inputs manuais
  sliderInput.addEventListener("input", (e) => updateSpeed(parseFloat(e.target.value)));
  numberInput.addEventListener("input", (e) => updateSpeed(parseFloat(e.target.value)));

  // Botões de velocidade fixa
  speedMenu.querySelector("#btn-05x").addEventListener("click", () => updateSpeed(0.5));
  speedMenu.querySelector("#btn-1x").addEventListener("click", () => updateSpeed(1));
  speedMenu.querySelector("#btn-2x").addEventListener("click", () => updateSpeed(2));

  // === Ícone de configurações (Engrenagem) ===
  const settingsIcon = svg.append("g")
    .attr("transform", "translate(80, 660)") // Posição próxima ao botão Play/Pause
    .style("cursor", "pointer")
    .on("click", (event) => {
      // Evita fechamento imediato do menu
      event.stopPropagation();
      speedMenu.style.display = (speedMenu.style.display === "none") ? "block" : "none";
    });

  // Ícone simples (placeholder visual)
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
    .text("⚙︎");
  
  // Adiciona o listener para fechar o menu ao clicar fora
  document.addEventListener("click", (event) => {
    // Verifica se o clique ocorreu fora do menu E fora do ícone de engrenagem
    if (!speedMenu.contains(event.target) && !settingsIcon.node().contains(event.target)) {
      speedMenu.style.display = "none";
    }
  });

  // Adicione também a linha para evitar a propagação nos inputs
  sliderInput.addEventListener("input", (e) => {
      e.stopPropagation(); // Adicione esta linha
      updateSpeed(parseFloat(e.target.value));
  });
  numberInput.addEventListener("input", (e) => {
      e.stopPropagation(); // Adicione esta linha
      updateSpeed(parseFloat(e.target.value));
  });
}

// Célula 11: [Encapsulamento do Sistema Solar] ===============================================
makeSolarSystem = (svg, planets, moons, scaleOrbits, center, onClickHandler) => {
  // Toda a renderização do sistema solar é movida para dentro de um grupo centralizado, facilitando a gestão das coordenadas relativas.
  const systemGroup = svg.append("g")
    .attr("transform", `translate(${center.x},${center.y})`);

  // === Sol ===
  systemGroup.append("circle")
    .attr("cx", 0)                             // Sol está na origem (0,0) do systemGroup
    .attr("cy", 0)
    .attr("r", 20)
    .attr("fill", "yellow")
    .style("cursor", "pointer")
    // Adiciona o evento de clique aqui para o Sol
    .on("click", (event, d) => onClickHandler(event, {name: "Sol", type: "Sol", radius: 696000, period: 0, orbit: 0}, 'Sol'))
    .append("title")
    .text("Sol");

  // === Órbitas dos planetas (traçadas reais via Path) ===
  systemGroup.selectAll("path.orbit-sun")
    .data(planets)
    .join("path")
    .attr("class", "orbit-sun")
    .attr("fill", "none")
    .attr("stroke", "rgba(255,255,255,0.2)")
    .attr("stroke-dasharray", "2,2")
    .attr("d", d => {
      // 1. Gera os pontos para o planeta específico
      const points = generateOrbitPathPoints(
        d, 
        auxiliaryOrbitalFunctions, // Passa a referência para a Célula 15
        scaleOrbits.planetScale    // Passa a referência para a Célula 4
      );

      // 2. Usa o gerador de linha do D3 para transformar os pontos em um atributo 'd' do path
      // Usamos .curve(d3.curveCardinalClosed) para fechar a curva suavemente
      return d3.line().curve(d3.curveCardinalClosed)(points);
    });

  // === Agrupamento das luas por planeta ===
  const moonsByPlanet = d3.group(moons, d => d.planet);

  // === Grupos dos planetas ===
  const planetGroups = systemGroup.selectAll("g.planet")
    .data(planets)
    .join("g")
    .attr("class", "planet");

  // === Função que adiciona anéis a um planeta ===
  function addPlanetRings(planetGroup, planetData) {
    
    const hasRings = ["Júpiter", "Saturno", "Urano", "Netuno"].includes(planetData.name);
    if (!hasRings) return; // Se não for um desses, sai da função.

    // Definimos raios internos e externos fictícios para os anéis, a inclinação, número e cor dos anéis
    let innerRadius, outerRadius, inclination, numRings, baseColor;

    switch(planetData.name){
      case "Júpiter":
        // Anéis finos e próximos ao planeta
        innerRadius = planetData.radius + 0.5;
        outerRadius = planetData.radius + 3;
        numRings = 2;
        baseColor = d3.color(planetData.color).darker(1.5);
        inclination = 0; // Júpter tem pouca inclinação visível
        break;
      case "Urano":
        // Anéis distintos e o planeta é inclinado (98 graus!)
        innerRadius = planetData.radius + 1;
        outerRadius = planetData.radius + 6;
        numRings = 3;
        baseColor = d3.color(planetData.color).darker(0.5);
        inclination = 90; // Visto de "lado"
        break;
      case "Netuno":
        // Anéis tênues e fragmentados
        innerRadius = planetData.radius + 0.5;
        outerRadius = planetData.radius + 4;
        numRings = 2;
        baseColor = d3.color(planetData.color).darker(0.5);
        inclination = 28;
        break;
      case "Saturno":
        // Anéis proeminentes
        innerRadius = planetData.radius + 2;
        outerRadius = planetData.radius + 10;
        numRings = 4;
        baseColor = d3.color(planetData.color).darker(0.5);
        inclination = 90; // Para visualização de "lado"
        break;
    }

    // Gera os dados para as múltiplas faixas dos anéis
    const ringsData = d3.range(numRings).map(i => {
      const t = i / (numRings - 1 || 1); // Normaliza o índice entre 0 e 1 e garante divisão por 1 se numRings for 1 ou 2
      return {
        inner: innerRadius + t * (outerRadius - innerRadius),
        outer: innerRadius + (t + 1/numRings) * (outerRadius - innerRadius),
        // Varia a cor e opacidade levemente para dar textura
        color: baseColor.brighter(t * 1.5), 
        opacity: 0.3 + t * 0.5 // Anéis externos mais opacos
      };
    });

    // Cria um grupo para todos os anéis e aplica a inclinação
    const ringsGroup = planetGroup.append("g")
      .attr("class", "planet-rings-group")
      .attr("transform", `rotate(${inclination}, 0, 0)`); // Aplica a inclinação correta

    ringsGroup.selectAll("path.planet-ring-segment")
      .data(ringsData)
      .join("path")
      .attr("class", "planet-ring-segment")
      .attr("d", d => {
        // Gerador de arco para cada segmento
        return d3.arc()
          .innerRadius(d.inner)
          .outerRadius(d.outer)
          .startAngle(0)
          .endAngle(2 * Math.PI)();
        })
      .attr("fill", d => d.color)
      .attr("fill-opacity", d => d.opacity);
  }

  // === Órbitas das luas (desenhadas dentro do grupo do planeta) ===
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
        .attr("r", d => scaleOrbits.moonScale(d.orbit))
        .attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.15)")
        .attr("stroke-dasharray", "1,1");
    });

    // === Renderização dos planetas e luas ===
    planetGroups.each(function(planetData) {
      const planetGroup = d3.select(this);

      // Este grupo interno rotacionará com a inclinação axial, mas a animação orbital 
      // na Célula 16 atuará no grupo PAI (`planetGroup`).
      const planetInnerGroup = planetGroup.append("g").attr("class", "planet-inner-group");

      // Chamamos a função para adicionar anéis a este grupo interno
      addPlanetRings(planetInnerGroup, planetData);

      // Planeta (círculo) desenhado DENTRO do grupo interno
      planetInnerGroup.append("circle")
        .attr("class", "planet-circle")
        .style("cursor", "pointer")
        .attr("r", d => d.radius)
        .attr("fill", d => d.color)
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("cx", 0)
        .attr("cy", 0)
        // Adiciona o evento de clique aqui para os Planetas
        .on("click", (event, d) => onClickHandler(event, d, 'planet'))
        .append("title")
        .text(d => d.name);

      // Luas (se existirem) - também adicionadas ao grupo interno para herdar a inclinação
      const planetMoons = moonsByPlanet.get(planetData.name);

      if (!planetMoons) return;                   // planeta sem luas → ignora

      // Cria grupo para as luas
      const moonGroups = planetInnerGroup.selectAll("g.moon")
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
        // Adiciona o evento de clique aqui para as Luas
        .on("click", (event, d) => onClickHandler(event, d, 'moon'))
        .append("title")
        .text(d => d.name);
    });

  return { planetGroups, moonsByPlanet, systemGroup };
};

// Célula 12: [Geração dos dados para os asteroides] ==========================================

asteroidBeltData = {
  // Define os raios orbitais de Marte e Júpiter (use os valores dos seus dados)
  const marsOrbitKM = planets.find(p => p.name === "Marte").orbit;
  const jupiterOrbitKM = planets.find(p => p.name === "Júpiter").orbit;

  // Define a faixa de órbita em KM (valores reais)
  const minOrbitKM = marsOrbitKM + 1e7; 
  const maxOrbitKM = jupiterOrbitKM - 1e7; 

  const numAsteroids = 1000;
  const asteroids = d3.range(numAsteroids).map(() => ({
    orbit_km: d3.randomUniform(minOrbitKM, maxOrbitKM)(), // Armazena a distância REAL
    angle: d3.randomUniform(0, 2 * Math.PI)(),
    speed: d3.randomUniform(0.5, 2.0)(),
    radius: d3.randomUniform(0.2, 1.5)()
  }));

  return asteroids;
}

// Célula 13: [Renderização dos asteroides] ===================================================

makeAsteroidBelt = (systemGroup, asteroids) => {
  // Cria um grupo de elementos (g) para cada asteroide.
  // Isso facilita a transformação e animação individual de cada um.
  const asteroidGroups = systemGroup.selectAll("g.asteroid")
    .data(asteroids)
    .join("g")
    .attr("class", "asteroid");

  // Adiciona um círculo para representar cada asteroide dentro de seu grupo.
  asteroidGroups.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", d => d.radius) // Define o raio do asteroide usando o valor do dado.
    .attr("fill", "gray") // Define a cor cinza para os asteroides.
    .attr("fill-opacity", d3.randomUniform(0.2, 0.7)()); // Define uma opacidade aleatória para variedade visual.

  return asteroidGroups;
}

// Célula 14: [Carregar Elementos Orbitais do GitHub] =========================================

async function fetchStaticOrbits() {
  const url = "https://raw.githubusercontent.com/daviteixeira-dev/Data-Visualization-SolarViz/main/data/planets_static.json";
  return fetch(url).then(r => r.json());
}

// Célula 14.1: [Cache dos Elementos Orbitais] ================================================

mutable staticOrbits = null;

// Célula 15: [Funções Orbitais Auxiliares] ===================================================

auxiliaryOrbitalFunctions = {
  function deg2rad(d) {
    return d * Math.PI / 180;
  }
  
  function solveKepler(M, e, tol = 1e-6) {
    let E = M;
    let delta = 1;
  
    while (Math.abs(delta) > tol) {
      delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      E -= delta;
    }
  
    return E;
  }
  
  function orbitalElementsToXY(el, timeDays = 0) {
    const {
      a_AU,
      eccentricity: e,
      M_deg,
      period_days
    } = el;
  
    const n = 2 * Math.PI / period_days;
    const M = deg2rad(M_deg) + n * timeDays;
    const E = solveKepler(M, e);
  
    const x = a_AU * (Math.cos(E) - e);
    const y = a_AU * Math.sqrt(1 - e * e) * Math.sin(E);
  
    return { x, y };
  }

  return { orbitalElementsToXY };
}

// Célula 15.1: [Tempo atual da animação] =====================================================

mutable currentAnimationTime = 0;

// Célula 16: [Gerar Pontos da Órbita] ========================================================

function generateOrbitPathPoints(planetData, orbitalFunctions, scaleFunction) {
  // Encontra os elementos orbitais estáticos para o planeta específico
  const el = mutable staticOrbits.planets[planetData.name];
  if (!el) return [];

  const points = [];
  const totalDays = el.period_days;
  const numPoints = 360; // 1 ponto por grau

  for (let i = 0; i < numPoints; i++) {
    const timeInDays = (i / numPoints) * totalDays;

    // Usa a função de Kepler da Célula 15 para obter X/Y em AU
    const posAU = orbitalFunctions.orbitalElementsToXY(el, timeInDays);

    // Converte de AU para KM
    const AU_TO_KM = 149597870;
    const x_km = posAU.x * AU_TO_KM;
    const y_km = posAU.y * AU_TO_KM;

    // Converte de KM para Pixels usando sua escala logarítmica da Célula 4
    const rKM = Math.sqrt(x_km**2 + y_km**2);
    const angleRad = Math.atan2(y_km, x_km);
    
    // Calcula a posição final em pixels para o SVG
    const x_px = scaleFunction(rKM) * Math.cos(angleRad);
    const y_px = scaleFunction(rKM) * Math.sin(angleRad);

    points.push([x_px, y_px]);
  }

  return points;
}

// Célula 17: [Tela de Planejamento da Missão] ================================================

makeMissionUI = function(container) {
  const missionDiv = html`<div style="
    position: absolute; top: 10px; left: 10px; background: rgba(17, 17, 17, 0.95);
    padding: 15px; border-radius: 8px; color: white; font-family: sans-serif;
    border: 1px solid #333; z-index: 1000; width: 240px; box-shadow: 0 4px 20px rgba(0,0,0,0.8);
  ">
    <h3 style="margin: 0 0 10px 0; font-size: 11px; color: #00ffcc; letter-spacing: 1px; text-align:center;">🚀 PLANEJADOR DE MISSÃO</h3>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <select id="origin" style="background: #222; color: white; border: 1px solid #444; font-size: 11px;">
        <option value="" disabled selected>Selecione a Origem</option>
        ${planets.map(p => `<option value="${p.name}">${p.name}</option>`)}
      </select>
      <select id="target" style="background: #222; color: white; border: 1px solid #444; font-size: 11px;">
        <option value="" disabled selected>Selecione o Destino</option>
        ${planets.map(p => `<option value="${p.name}">${p.name}</option>`)}
      </select>
      <div style="display: flex; gap: 5px;">
        <button id="btnConfirm" style="flex:2; background: #006644; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: bold;">TRAÇAR ROTA</button>
        <button id="btnReset" style="flex:1; background: #442222; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">RESET</button>
      </div>
    </div>
    <div id="missionStats" style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #222; font-size: 11px; color: #aaa; display:none;">
    </div>
  </div>`;

  // Lógica dos Botões
  missionDiv.querySelector("#btnConfirm").onclick = () => {
    const origin = missionDiv.querySelector("#origin").value;
    const target = missionDiv.querySelector("#target").value;
    if (origin && target && origin !== target) {
      mutable mission = { origin, target };
      missionDiv.querySelector("#missionStats").style.display = "block";
    } else {
      alert("Selecione planetas de origem e destino diferentes.");
    }
  };

  missionDiv.querySelector("#btnReset").onclick = () => {
    mutable mission = null;
    missionDiv.querySelector("#origin").value = "";
    missionDiv.querySelector("#target").value = "";
    missionDiv.querySelector("#missionStats").style.display = "none";
  };

  container.appendChild(missionDiv);
  return missionDiv;
}

// Célula 18: [Viewof Sistema Solar + Animação] ===============================================
viewof solarSystem = {

  transferData; // Força a célula a observar a rota.
  
  mutable livePositions;
  mutable mission;

  // === Carrega dados STATIC uma vez ===
  if (!mutable staticOrbits) {
    mutable staticOrbits = await fetchStaticOrbits();
  }

  // === Estado da animação ===
  let lastRawElapsed = 0;                   // Armazena o tempo bruto do último frame
  let lastFrameTime = performance.now();    // Rastreamento do tempo entre frames para suavidade

  let liveInterval = null;

  // Variáveis para rastrear o estado da transformação do zoom (usado para fechar suavemente)
  let currentTransform = d3.zoomIdentity;

  // === Container principal ===
  // Passamos a largura do painel para o container (350px)
  const { container, svg } = makeContainerCell(containerAndDimensions.width + 350, containerAndDimensions.height);

  // INJEÇÃO DA UI DE MISSÃO
  const missionUI = makeMissionUI(container);

  // === Fundo Estrelado ===
  makeStarfield(svg, containerAndDimensions.width, containerAndDimensions.height);

  // === Função para fechar painel e resetar visualização ===
  const closePanelAndResetView = () => {
    mutable selectedObject = null; // Reseta o estado de seleção
    
    // Aplica a transição de volta ao normal (scale 1, no centro original)
    systemGroup.transition()
      .duration(800)
      .attr("transform", `translate(${containerAndDimensions.center.x},${containerAndDimensions.center.y}) scale(1)`);
      
    infoPanel.style.display = "none"; // Esconde o painel visualmente

    // Retoma a animação se estava pausada para o zoom
    if (!mutable isRunning) {
        mutable isRunning = true; 
        buttonText.text("Pause");
        // Ajusta o tempo acumulado para evitar "pulo" na animação quando retomar
        mutable accumulatedPauseTime += lastRawElapsed - mutable pauseStart;
    }
  };

  // === Botão Play/Pause ===
  const {text: buttonText } = makePlayPauseButton(svg, () => {
    // Acessa e altera a variável 'mutable'
    mutable isRunning = !mutable isRunning; // Alterna o estado (Play/Pause)

    if (!mutable isRunning) {
      mutable pauseStart = lastRawElapsed; // Marca início da pausa
      buttonText.text("Play");
    } else {
      // Calcule a duração dessa última pausa e adicione ao total acumulado
      mutable accumulatedPauseTime += lastRawElapsed - mutable pauseStart;
      buttonText.text("Pause");
    }
  });

  // === Menu de Velocidade (Engrenagem + Controles) ===
  makeSpeedMenu(container, svg);

  // === Painel de Informações ===
  // Passamos a função de fechamento para makeInfoPanel
  const infoPanel = makeInfoPanel(container, containerAndDimensions.width, closePanelAndResetView);

  // Função interna para preencher e mostrar o painel
  const updateInfoPanel = (obj) => {
    if(!obj){
      infoPanel.style.display = "none";
      return;
    }

    // 1. Busca dados técnicos do array do colega
    const pData = planets.find(p => p.name === obj.name);

    // 2. Preenchimento de Cabeçalho
    infoPanel.querySelector("#objectName").textContent = obj.name;
    infoPanel.querySelector("#objectType").textContent = obj.type === 'planet' ? 'PLANETA' : (obj.type === 'Sol' ? 'ESTRELA' : 'LUA');
    
    if (pData) {
      infoPanel.querySelector("#planetImg").src = pData.img;
      infoPanel.querySelector("#objectRadius").innerHTML = `${pData.realRadius.toLocaleString()} <small style="color:#555">km</small>`;
      infoPanel.querySelector("#objectPeriod").innerHTML = `${pData.period.toLocaleString()} <small style="color:#555">dias</small>`;
      infoPanel.querySelector("#objectOrbit").innerHTML = `${(pData.orbit / 1e6).toFixed(1)} <small style="color:#555">mi km</small>`;
    }

    // 3. Renderização dos 4 Gráficos
    const area = infoPanel.querySelector("#chartArea");
    area.innerHTML = ""; // Limpa os gráficos do planeta anterior
    //area.style.display = "grid";
    //area.style.gridTemplateColumns = "1fr 1fr"; // Cria as duas colunas
    //area.style.gap = "20px";
  
    if (obj.type === 'planet') {
      const sections = [
        { title: "Comparaçao de Raio (Escala Real)", fn: createComparisonBubbleChart },
        { title: "Distribuição de Massa (Log)", fn: createMassChart },
        { title: "Mapeamento de Distância", fn: createOrbitLineChart },
        { title: "Duração do Ano (Translação)", fn: createHorizontalBarChart }
      ];
  
      sections.forEach(s => {
        const card = document.createElement("div");
        card.style.cssText = "background: #111; padding: 15px; border-radius: 8px; border: 1px solid #222;";
        card.innerHTML = `<h4 style="margin:0 0 15px 0; font-size:11px; color:#555; text-transform:uppercase; letter-spacing:1px;">${s.title}</h4>`;
        
        // Passamos o nome do planeta e a largura do painel (ajustada para as margens)
        const chartElement = s.fn(obj.name, 370);
        card.appendChild(chartElement);
        area.appendChild(card);
      });
    } else {
      area.innerHTML = `<div style="text-align:center; color:#444; margin-top:50px;">Gráficos detalhados disponíveis apenas para planetas.</div>`;
    }
    
    infoPanel.style.display = "block";
  };

  // === Projeção das escalas ===
  const projectLivePosition = (pos) => {
    // 1. Calcula a distância real (Pitágoras) em KM a partir dos dados da API
    // Ignoramos a inclinação Z e projetamos tudo no plano XY
    const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
  
    // 2. USA A MESMA planetScale da Célula 4 para escalonar a distância real
    const scaledR = scaleOrbits.planetScale(r);

    // 3. Calcula o ângulo real atual (Atan2)
    const angle = Math.atan2(pos.y, pos.x);

    // 4. Retorna a posição projetada para o SVG
    return {
      x: scaledR * Math.cos(angle),
      y: scaledR * Math.sin(angle)
    };
  };

  // Função para calcular a posição X, Y de um objeto baseado no tempo de animação
  const getObjectPosition = (d, currentTime) => {
    // Calcula a posição do objeto relativo ao seu centro orbital (Sol para planetas, Planeta para luas)
    let angle, orbitRadius;

    if(d.type === 'planet' || d.type === 'Sol'){
      angle = (currentTime / (d.period * 100)) * 2 * Math.PI;
      orbitRadius = scaleOrbits.planetScale(d.orbit);
      
      // Garante que o retorno seja (0, 0) se for o Sol
      if(d.type === 'Sol') return {x: 0, y: 0}; 

      return { x: orbitRadius * Math.cos(angle), y: orbitRadius * Math.sin(angle) };
    
    } else if(d.type === 'moon'){
      // Encontra os dados do planeta pai
      const parentPlanet = planets.find(p => p.name === d.planet);
      if(!parentPlanet) return {x: 0, y: 0};

      // 1. Posição do planeta pai (relativo ao Sol)
      const planetAngle = (currentTime / (parentPlanet.period * 100)) * 2 * Math.PI;
      const planetOrbitRadius = scaleOrbits.planetScale(parentPlanet.orbit);
      const planetX = planetOrbitRadius * Math.cos(planetAngle);
      const planetY = planetOrbitRadius * Math.sin(planetAngle);

      // 2. Posição da lua (relativa ao planeta pai)
      const moonAngle = (currentTime / (d.period * 50)) * 2 * Math.PI;
      const moonOrbitRadius = scaleOrbits.moonScale(d.orbit);
      const moonX = moonOrbitRadius * Math.cos(moonAngle);
      const moonY = moonOrbitRadius * Math.sin(moonAngle);

      // Posição final da lua (relativa ao Sol)
      return { x: planetX + moonX, y: planetY + moonY };
    }
    return { x: 0, y: 0 }; // Fallback
  };

  // === Botão de Ativar LIVE ===
  const { statusIndicator } = makeLiveButton(svg, async () => { // <--- Captura o statusIndicator
    mutable isLiveMode = !mutable isLiveMode;

    
    // Adicione uma referência global para as órbitas (se ainda não tiver)
    const orbitPaths = svg.selectAll("path.orbit-sun"); 

    if (mutable isLiveMode) {

      // --- NOVO: Oculta as linhas de órbita estáticas ---
      orbitPaths.style("display", "none");
      
      statusIndicator.attr("fill", "yellow"); // <--- Amarelo: Carregando
      liveStatusText.text("Carregando..."); // <-- Mostra o carregando

      // Buscamos a posição atual imediatamente
      // Passamos o callback para função fetch
      mutable livePositions = await fetchAllLivePositions(status => {
        liveStatusText.text(status); // <-- Atualiza o texto com o resultado
        if (status.includes("Erro")) {
          liveStatusText.attr("fill", "red");
          statusIndicator.attr("fill", "red"); // <--- Vermelho: Erro
        } else {
          liveStatusText.attr("fill", "lightgreen");
          statusIndicator.attr("fill", "green"); // <--- Verde: Ativo
        }
      });

      // Configura a atualização periódica (15s)
      liveInterval = setInterval(async () => {
        liveStatusText.text("Atualizando...");
        statusIndicator.attr("fill", "yellow"); // <--- Amarelo: Atualizando
        
        mutable livePositions = await fetchAllLivePositions(status => {
          liveStatusText.text("LIVE Ativo: " + status.toLowerCase().replace("sucesso!", "dados atualizados."));
          statusIndicator.attr("fill", "green"); // <--- Verde: Ativo
        });
      }, 15000);

    } else {
      // --- NOVO: Mostra as linhas de órbita no modo estático ---
      orbitPaths.style("display", "block");
      
      // Modo Simulação (desliga o LIVE)
      clearInterval(liveInterval);
      liveInterval = null;
      liveStatusText.text("Simulação Ativa"); // <-- Limpa o status
      liveStatusText.attr("fill", "gray");
      statusIndicator.attr("fill", "red"); // <--- Vermelho: Inativo
    }
  });

  // === Indicador de Status LIVE ===
  const liveStatusText = svg.append("text")
    .attr("x", 220) // Posição X ao lado do botão LIVE
    .attr("y", 673) // Posição Y centralizada com o botão
    .attr("fill", "gray")
    .attr("text-anchor", "start")
    .style("font-size", "12px")
    .text(""); // Texto inicial vazio

  const orbitPaths = svg.selectAll("path.orbit-sun");

  // === Criação do sistema solar ===
  // Passamos a função handleClick simplificada que apenas atualiza a mutable
  const { planetGroups, moonsByPlanet, systemGroup } = makeSolarSystem(
    svg, 
    planets, 
    moons, 
    scaleOrbits, 
    containerAndDimensions.center, 
    (event, d, type) => {
      event.stopPropagation();

      // Pausa a animação imediatamente
      if (mutable isRunning) {
        mutable isRunning = false;
        buttonText.text("Play");
        mutable pauseStart = lastRawElapsed; 
      }
      
      mutable selectedObject = { ...d, type: type };
      // isPanelOpen agora é gerenciado implicitamente pela presença de selectedObject
      // Chamamos a função do painel diretamente aqui no click:
      updateInfoPanel(mutable selectedObject); // Abre o painel

      // --- LÓGICA DO ZOOM ---
      let targetX, targetY;

      if(mutable isLiveMode && mutable livePositions?.[d.name]){
        // Se estiver em LIVE, use a posição REAL (eixo X/Y) e a função de projeção
        const livePos = mutable livePositions[d.name];
        const projectedPos = projectLivePosition(livePos);
        targetX = projectedPos.x;
        targetY = projectedPos.y;
        
      } else if(mutable staticOrbits?.planets?.[d.name]){
        // SE ESTIVER NO MODO ESTÁTICO (GitHub), use a mesma conta Kepler do updatePositions
        const el = mutable staticOrbits.planets[d.name];
        const posAU = auxiliaryOrbitalFunctions.orbitalElementsToXY(el, mutable currentAnimationTime / 100);
        const AU_TO_KM = 149597870;
        const rKM = Math.sqrt((posAU.x * AU_TO_KM)**2 + (posAU.y * AU_TO_KM)**2);
        const angleRad = Math.atan2(posAU.y, posAU.x);
        const pos = calculateXY(rKM, angleRad, scaleOrbits.planetScale);
        targetX = pos.x; targetY = pos.y;
      } else {
        // Fallback para Sol ou simulação básica
        const pos = getObjectPosition(d, mutable currentAnimationTime);
        targetX = pos.x; targetY = pos.y;
      }

      const scale = 5; // Fator de zoom fixo para todos os objetos

      // Aplica a transformação suave manualmente
      // Usamos .attr("transform", ...) e d3.transition para evitar conflitos com d3.zoom API
      systemGroup.transition()
        .duration(1000)
        .attr("transform", 
          `translate(${containerAndDimensions.center.x}, ${containerAndDimensions.center.y}) scale(${scale}) translate(${-targetX}, ${-targetY})`
        );
    }
  );

  // Desabilitar completamente a interação manual (scroll/drag/wheel)
  svg.on(".zoom", null);

  // Chama a função para criar o cinturão de asteroides
  const asteroidGroups = makeAsteroidBelt(systemGroup, asteroidBeltData);

  // === Criação do elemento da Rota de Transferência
  const routePath = systemGroup.append("path")
    .attr("class", "hohmann-route")
    .attr("fill", "none")
    .attr("stroke", "#ff4444")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .style("pointer-events", "none");
    //.style("opacity", 0);

  // === Função auxiliar para converter distância radial para X/Y usando a escala LOG ===
  const calculateXY = (distanceKM, angleRad, scaleFunc) => {
      const scaledR = scaleFunc(distanceKM);
      return {
          x: scaledR * Math.cos(angleRad),
          y: scaledR * Math.sin(angleRad)
      };
  };

  // === Função auxiliar para pegar a posição atual de qualquer planeta no tempo 'time' ===
  const getPos = (planetName, time) => {
    const AU_TO_KM = 149597870;
    if (mutable isLiveMode && mutable livePositions?.[planetName]) {
      return projectLivePosition(mutable livePositions[planetName]);
    } else if (mutable staticOrbits?.planets?.[planetName]) {
      const el = mutable staticOrbits.planets[planetName];
      const posAU = auxiliaryOrbitalFunctions.orbitalElementsToXY(el, time / 100);
      const rKM = Math.sqrt((posAU.x * AU_TO_KM)**2 + (posAU.y * AU_TO_KM)**2);
      const angleRad = Math.atan2(posAU.y, posAU.x);
      return calculateXY(rKM, angleRad, scaleOrbits.planetScale);
    } else {
      const p = planets.find(x => x.name === planetName);
      return getObjectPosition(p, time);
    }
  };

  // Função de atualização da posição dos elementos (chamada inicial e no timer)
  const updatePositions = (time) => {
    
    // === Movimento orbital dos planetas ===

    // 1. Definimos a seleção base dos planetas
    const selection = planetGroups;

    // 2. Aplique a transição SE estiver no modo LIVE, senão atualize instantaneamente (simulação padrão)
    //const transitionSelection = mutable isLiveMode ? selection.transition().duration(1000) : selection;
    const transitionSelection = selection;

    // 3. Aplique a transformação (mesma lógica de cálculo de x, y)
    transitionSelection.attr("transform", d => {

      let x, y;

      // === 1. LIVE (backend) ===
      if(mutable isLiveMode && mutable livePositions?.[d.name]){
  
        const posKM = mutable livePositions[d.name]; // Posição X/Y em KM
  
        const rKM = Math.sqrt(posKM.x * posKM.x + posKM.y * posKM.y);
  
        const angleRad = Math.atan2(posKM.y, posKM.x);
          
        const pos = calculateXY(rKM, angleRad, scaleOrbits.planetScale);
        x = pos.x;
        y = pos.y;
  
      // === 2. STATIC (GitHub JSON) === 
      } else if(mutable staticOrbits && mutable staticOrbits.planets?.[d.name]){
  
        // Acessa o objeto do planeta usando a chave correta
        const el = mutable staticOrbits.planets[d.name];
          
        // Calcula posição orbital em AU (Unidades Astronômicas)
        const posAU = auxiliaryOrbitalFunctions.orbitalElementsToXY(
          el,
          mutable currentAnimationTime / 100 // Ajuste o divisor para a velocidade da simulação
        );
      
        // CONVERTE DE AU PARA KM (1 AU = ~149.6 milhões de KM)
        const AU_TO_KM = 149597870;
        const x_km = posAU.x * AU_TO_KM;
        const y_km = posAU.y * AU_TO_KM;
  
        const rKM = Math.sqrt(x_km * x_km + y_km * y_km);
        const angleRad = Math.atan2(y_km, x_km);
          
        const pos = calculateXY(rKM, angleRad, scaleOrbits.planetScale);
        x = pos.x;
        y = pos.y;
  
      // === 3. Fallback matemático (se o LIVE falhar) ===
      }else{
        const angleRad = (mutable currentAnimationTime / (d.period * 100)) * 2 * Math.PI;
        const orbitRadiusKM = d.orbit; // Valor em KM do array original
          
        const pos = calculateXY(orbitRadiusKM, angleRad, scaleOrbits.planetScale);
        x = pos.x;
        y = pos.y;
      }
  
      return `translate(${x}, ${y})`;
      
    });

    // === Movimento orbital das luas (relativo ao planeta) ===
    planetGroups.each(function(planetData) {
      const planetMoons = moonsByPlanet.get(planetData.name);
      if (!planetMoons) return;
      
      d3.select(this).selectAll("g.moon").attr("transform", d => {

        // Identifica o nome do planeta pai (ex: "Terra", "Júpiter")
        const parentPlanetName = d.planet;

        // Verifica se estamos no modo LIVE e se temos os dados da Lua E do Planeta Pai
        if (mutable isLiveMode && mutable livePositions[d.name] && mutable livePositions[parentPlanetName]) {
          
          const liveMoonSun = mutable livePositions[d.name];
          const liveParentSun = mutable livePositions[parentPlanetName];
          
          // 1. Calcular a posição da Lua relativa ao Planeta Pai (em KM)
          const moonRelX = liveMoonSun.x - liveParentSun.x;
          const moonRelY = liveMoonSun.y - liveParentSun.y;

          // 2. Calcular a distância (raio) e o ângulo relativos
          const rKM = Math.sqrt(moonRelX ** 2 + moonRelY ** 2);
          const angle = Math.atan2(moonRelY, moonRelX);
        
          // 3. Usamos a sua escala de luas definida na Célula 4
          const scaledR = scaleOrbits.moonScale(rKM);

          // 4. Transformar em coordenadas X, Y escalonadas
          const x = scaledR * Math.cos(angle);
          const y = scaledR * Math.sin(angle);

          // Aplicar a translação local
          return `translate(${x}, ${y})`;
        }

        // FALLBACK: Simulação matemática para quaisquer luas se o LIVE falhar
        const moonAngle = (time / (d.period * 50)) * 2 * Math.PI;
        const moonOrbitRadius = scaleOrbits.moonScale(d.orbit);
        
        // Rotaciona primeiro em torno do Planeta (origem local), depois translada para a distância orbital.
        return `rotate(${moonAngle * 180 / Math.PI}) translate(${moonOrbitRadius}, 0)`;
      });
    });

    // === Movimento orbital dos asteroides ===
    asteroidGroups.attr("transform", d => {
      
      // Ajuste o multiplicador 0.0005 para aumentar ou diminuir a velocidade geral dos asteroides
      const angleRad = (time * 0.0005 * d.speed) + d.angle;
      const scaledR = scaleOrbits.planetScale(d.orbit_km);
    
      const x = scaledR * Math.cos(angleRad);
      const y = scaledR * Math.sin(angleRad);
      return `translate(${x}, ${y})`;
    });


    // === LÓGICA DA ROTA DE TRANSFERÊNCIA (HOHMANN) ===

    //const currentTransfer = transferData;

    const currentTransfer = transferData;
    
    // Verifica se transferData existe e se contém os planetas antes de prosseguir
    if (currentTransfer && currentTransfer.p1 && currentTransfer.p2) {
      const { p1, p2, aTrans, e, phaseAngle, r1, r2, transferTime  } = currentTransfer;
      const AU_TO_KM = 149597870;
      
      // Obter posições atuais usando a função getPos (agora definida acima)
      const pos1 = getPos(p1.name, time);
      const pos2 = getPos(p2.name, time);
  
      // 1. Calcular ângulo de fase ATUAL
      const angle1Rad = Math.atan2(pos1.y, pos1.x);
      const angle2Rad = Math.atan2(pos2.y, pos2.x);
      
      // Ângulo de fase atual considerando o sentido anti-horário do sistema solar
      let currentPhase = ((angle2Rad - angle1Rad) * (180 / Math.PI) + 360) % 360;
  
      // 2. Verificar Janela (Tolerância 2 graus)
      // Se estivermos indo para dentro, o alvo deve estar "atrás" na órbita
      // A tolerância de 5 graus é boa para a simulação
      const isWindowOpen = Math.abs(currentPhase - phaseAngle) < 5 || Math.abs(currentPhase - phaseAngle) > 355; 
      
      routePath.style("display", "block");
      routePath.attr("stroke", isWindowOpen ? "#00ff88" : "#ff4444")
               .attr("opacity", isWindowOpen ? 1 : 0.4);
        
      const direction = r1 > r2 ? -1 : 1;

      const rotation = Math.atan2(pos1.y, pos1.x);
  
      // 3. Gere os pontos com a correção de direção (Interno vs Externo)
      const points = d3.range(0, Math.PI + 0.1, 0.1).map(theta => {
        
        const angleAdjustment = r1 > r2 ? Math.PI : 0;
        const r_km = (aTrans * (1 - e * e)) / (1 + e * Math.cos(theta + angleAdjustment)) * AU_TO_KM;
        //const r_km = (aTrans * (1 - e * e)) / (1 + e * Math.cos(theta)) * AU_TO_KM;
        
        const scaledR = scaleOrbits.planetScale(r_km);

        return [scaledR * Math.cos(direction * theta + rotation), scaledR * Math.sin(direction * theta + rotation)];
      });
  
      routePath.attr("d", d3.line()(points));

      // 4. ATUALIZAÇÃO DA INTERFACE (HUD)
      const statsDiv = document.querySelector("#missionStats");
      if (statsDiv) {
        statsDiv.style.display = "block";
        statsDiv.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Voo estimado:</span> <span style="color:white">${Math.round(transferTime)} dias</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Distância:</span> <span style="color:white">${(aTrans * 149.6).toFixed(1)}M km</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Janela:</span> 
            <span style="color: ${isWindowOpen ? "#00ff88" : "#ff4444"}; font-weight: bold;">
              ${isWindowOpen ? "ABERTA" : "AGUARDANDO"}
            </span>
          </div>
        `;
      }
    } else {
      // Se não houver missão, esconda a rota
      if (routePath) routePath.style("display", "none");
      const statsDiv = document.querySelector("#missionStats");
      if (statsDiv) statsDiv.style.display = "none";
    }

  };

  // Aplica as posições iniciais imediatamente após a criação dos elementos
  updatePositions(mutable currentAnimationTime);

  // === Lógica principal da animação ===
  const timer = d3.timer(rawElapsed => {
    // Mantém o último tempo bruto para lógica de pausa/play
    lastRawElapsed = rawElapsed;

    // Cálculo do delta entre frames (garante animação suave)
    const currentFrameTime = performance.now();
    const deltaTime = currentFrameTime - lastFrameTime;
    lastFrameTime = currentFrameTime;

    // A animação só ocorre se a simulação estiver rodando E nada estiver selecionado (sem zoom fixo)
    if(!mutable selectedObject && mutable isRunning){
      // Atualiza tempo interno da simulação baseado na velocidade
      mutable currentAnimationTime += deltaTime * mutable speed;
    }

    // Chamamos a função de atualização de posições
    updatePositions(mutable currentAnimationTime);
    
    // Se estiver pausado, o loop simplesmente não faz nada dentro do 'if', 
    // e o accumulatedPauseTime é ajustado no próximo clique em "Play".
  });

  // Limpeza automática do timer no Observable
  invalidation.then(() => {
    timer.stop();
    if (liveInterval) clearInterval(liveInterval);
  });
  return container;
}

// Célula 18.1: [Estado de Seleção] ===========================================================
// Armazena o objeto selecionado (planeta, lua ou sol). Null se nada estiver selecionado.
mutable selectedObject = null;

// Célula 18.2: [Estado do painel lateral] ====================================================
// Controla a visibilidade do painel lateral.
mutable isPanelOpen = false;

// Célula 19: [Painel de Informações Lateral] =================================================

makeInfoPanel = function(container, width, onCloseHandler) {
  
  const infoPanel = document.createElement("div");
  infoPanel.style.position = "absolute";
  infoPanel.style.top = "10px";
  infoPanel.style.right = "0px";
  infoPanel.style.height = "95%";
  infoPanel.style.width = "420px"; // Larga o suficiente para gráficos e informações
  infoPanel.style.background = "#1a1a1a";
  infoPanel.style.padding = "20px";
  infoPanel.style.color = "white";
  infoPanel.style.boxShadow = "-4px 0 8px rgba(0,0,0,0.5)";
  infoPanel.style.display = "none"; // Oculto por padrão
  infoPanel.style.overflowY = "auto";
   infoPanel.style.zIndex = "1000";
  infoPanel.style.transition = "right 0.5s ease-in-out"; // Transição suave

  // Estrutura interna inicial (será preenchida dinamicamente)
  infoPanel.innerHTML = `
    <button id="closePanelBtn" style="float: right; background: #222; border: 1px solid #444; color: white; cursor: pointer; padding: 8px 15px; border-radius: 4px; font-size:12px;">✕ FECHAR</button>
    
    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px;">
      <img id="planetImg" src="" style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid #333; object-fit: cover; box-shadow: 0 0 15px rgba(255,255,255,0.1);">
      <div>
        <h2 id="objectName" style="margin:0; font-size: 28px; letter-spacing: 1px; text-transform: uppercase;">---</h2>
        <span id="objectType" style="color: #666; font-size: 14px; font-weight: bold; letter-spacing: 1px;">---</span>
      </div>
    </div>

    <div id="objectDetails" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #161616; padding: 20px; border-radius: 12px; border: 1px solid #222; margin-bottom: 30px;">
      <div><strong style="color:#555; font-size: 10px; display:block; margin-bottom:4px;">RAIO EQUATORIAL</strong> <div id="objectRadius" style="font-size:16px;"></div></div>
      <div><strong style="color:#555; font-size: 10px; display:block; margin-bottom:4px;">PERÍODO ORBITAL</strong> <div id="objectPeriod" style="font-size:16px;"></div></div>
      <div style="grid-column: span 2; border-top: 1px solid #222; pt: 10px;"><strong style="color:#555; font-size: 10px; display:block; margin-top:10px; margin-bottom:4px;">DISTÂNCIA DO SOL</strong> <div id="objectOrbit" style="font-size:16px;"></div></div>
    </div>

    <div id="chartArea" style="display: flex; flex-direction: column; gap: 25px;">
        <!-- Gráficos entrarão aqui -->
    </div>
  `;

  container.appendChild(infoPanel);

  // Adiciona o listener para fechar o painel, usando o novo handler passado
  infoPanel.querySelector("#closePanelBtn").addEventListener("click", onCloseHandler);

  return infoPanel;
}

// Célula 20: [Estado global do modo LIVE] ====================================================

// Célula 20.1: [Modo de operação] ============================================================
mutable isLiveMode = false;

// Célula 20.2: [Cache local das posições LIVE] ===============================================
mutable livePositions = {};

// Célula 21: [Fetch LIVE para TODOS os corpos] ===============================================

async function fetchAllLivePositions(setStatus = () => {}) {

  setStatus("Carregando..."); // Define o status inicial 
  
  const bodies = [
    "Mercury","Venus","Earth","Mars",
    "Jupiter","Saturn","Uranus","Neptune",
    "Moon", "Io", "Europa", "Ganymede",
    "Callisto", "Titan"
  ];

  const requests = bodies.map(p =>
    fetch(`https://data-visualization-solar-viz.vercel.app/api/live?body=${p}`)
      .then(r => r.json())
      .then(j => ({ name: p, data: j }))
      .catch(() => null)
  );

  const results = await Promise.all(requests);

  const positions = {};

  const nameMap = {
    "Mercury": "Mercúrio", "Venus": "Vênus", "Earth": "Terra", "Mars": "Marte",
    "Jupiter": "Júpiter", "Saturn": "Saturno", "Uranus": "Urano", "Neptune": "Netuno",
    "Moon": "Lua", "Io": "Io", "Europa": "Europa", "Ganymede": "Ganimedes", "Callisto": "Calisto",
    "Titan": "Titã"
  };
  
  for (const r of results) {
    if (!r || !r.data?.position) continue;
    const ptName = nameMap[r.name]; // Converte para o nome usado no array bodies

    // Projeção simples heliocêntrica 2D
    positions[ptName] = {
      x: r.data.position.x_km,
      y: r.data.position.y_km
    };
  }

  // Verificação de sucesso para o status
  const fetchedCount = Object.keys(positions).length;
  if (fetchedCount === bodies.length) {
      setStatus("Sucesso!");
  } else {
      setStatus(`Erro: ${fetchedCount} corpos carregados.`);
  }

  return positions;
}

// Célula 22: [Botão LIVE] ====================================================================

makeLiveButton = function(svg, onToggle){
  const g = svg.append("g")
    .attr("transform","translate(150,660)")
    .style("cursor","pointer")
    .on("click", onToggle);

  // Fundo do botão (agora neutro, a cor do status é o indicador)
  g.append("rect")
    .attr("width", 60)
    .attr("height", 25)
    .attr("fill", "#333") // Cor de fundo escura
    .attr("rx", 5);

  // Texto "LIVE"
  const text = g.append("text")
    .attr("x", 27)
    .attr("y", 17)
    .attr("fill", "white")
    .attr("text-anchor","middle")
    .text("LIVE");

  // === NOVO: Círculo de Status (Inicialmente Vermelho - Inativo) ===
  const statusIndicator = g.append("circle")
    .attr("cx", 55) // Posição à direita do texto
    .attr("cy", 7)  // Posição superior
    .attr("r", 4)   // Tamanho do círculo
    .attr("fill", "red"); // Cor inicial: Inativo

  // Retornamos a referência ao indicador para uso externo
  return { g, text, statusIndicator };
};

// Célula 23: [Dashboard Analítico] ===========================================================

// Célula 23.1: [Gráfico de bolhas comparativo] ===============================================

createComparisonBubbleChart = (focusPlanetName, containerWidth) => {
  // 1. Configurações de Dimensão Adaptáveis
  const width = containerWidth || 400;
  const height = 220; // Aumentado um pouco para caber as labels
  const margin = { top: 50, right: 30, bottom: 40, left: 30 };

  // 2. Cálculo da área útil vertical
  const chartHeight = height - margin.top - margin.bottom;

  // 3. Escalas usando seus dados unificados
  const maxRadius = d3.max(planets, d => d.realRadius);

  // 4. Escala de Tamanho Rigorosa
  // O raio máximo será metade da altura útil para garantir que o 
  // diâmetro (2 * raio) nunca ultrapasse o topo do SVG.
  const sizeScale = d3.scaleLinear()
    .domain([0, maxRadius])
    .range([3, chartHeight / 2]);

  const xScale = d3.scalePoint()
    .domain(planets.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.6);

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible")
    .style("display", "block");

  // 5. Linha de base (Estilo do colega)
  svg.append("line")
    .attr("x1", margin.left - 10)
    .attr("x2", width - margin.right + 10)
    .attr("y1", height - margin.bottom)
    .attr("y2", height - margin.bottom)
    .attr("stroke", "#333")
    .attr("stroke-width", 1);

  // 6. Grupos Visuais
  const planetGroups = svg.selectAll("g.planet-visual")
    .data(planets)
    .join("g")
    .attr("class", "planet-visual")
    .attr("transform", d => `translate(${xScale(d.name)}, ${height - margin.bottom})`);

  // 7. Círculos com estilo de destaque
  planetGroups.append("circle")
    .attr("class", "planet-circle")
    .attr("r", d => sizeScale(d.realRadius))
    .attr("cy", d => -sizeScale(d.realRadius)) // Move o centro para cima conforme o raio aumenta
    .attr("fill", d => d.name === focusPlanetName ? d.color : "#444")
    .attr("fill-opacity", d => d.name === focusPlanetName ? 0.85 : 0.4)
    .attr("stroke", d => d.name === focusPlanetName ? "white" : "#666")
    .attr("stroke-width", d => d.name === focusPlanetName ? 2 : 1)
    .style("transition", "all 0.2s ease"); // Transição suave para o hover

  // 8. Labels (Nomes)
  planetGroups.append("text")
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("fill", d => d.name === focusPlanetName ? "white" : "#888")
    .style("font-size", "11px")
    .style("font-family", "sans-serif")
    .style("font-weight", d => d.name === focusPlanetName ? "600" : "400")
    .text(d => d.name.substring(0, 3).toUpperCase());

  // 9. Tooltip (Injetado no body para sobrepor o painel)
  const tooltip = d3.select("body").selectAll(".bubble-tooltip").data([null]).join("div")
    .attr("class", "bubble-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(15,15,15,0.95)")
    .style("color", "white")
    .style("padding", "8px 12px")
    .style("border", "1px solid #444")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("z-index", "3000")
    .style("box-shadow", "0 4px 10px rgba(0,0,0,0.5)");

  // 9. Camada de Interação (Zonas de Captura)
  const step = (width - margin.left - margin.right) / (planets.length - 1 || 1);

  svg.append("g")
    .selectAll("rect")
    .data(planets)
    .join("rect")
    .attr("x", d => xScale(d.name) - step / 2)
    .attr("y", 0)
    .attr("width", step)
    .attr("height", height)
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("mouseover", (event, d) => {
      const targetGroup = svg.selectAll(".planet-visual").filter(p => p.name === d.name);
      
      targetGroup.select(".planet-circle")
        .attr("stroke-width", 3)
        .attr("stroke", "white")
        .attr("fill-opacity", 1);
        
      targetGroup.select("text").attr("fill", "white");

      tooltip.style("visibility", "visible")
        .html(`<strong>${d.name}</strong><br>Raio: ${d.realRadius.toLocaleString()} km`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", (event.pageY - 45) + "px")
        .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", (event, d) => {
      const targetGroup = svg.selectAll(".planet-visual").filter(p => p.name === d.name);
      const isFocus = d.name === focusPlanetName;

      targetGroup.select(".planet-circle")
        .attr("stroke", isFocus ? "white" : "#666")
        .attr("stroke-width", isFocus ? 2 : 1)
        .attr("fill-opacity", isFocus ? 0.85 : 0.4);
        
      targetGroup.select("text").attr("fill", isFocus ? "white" : "#666");

      tooltip.style("visibility", "hidden");
    });

  return svg.node();
}

// Célula 23.2: [Gráfico de massa] ============================================================

createMassChart = (focusPlanetName, containerWidth) => {
  // 1. Configurações de Dimensão Adaptáveis
  const width = containerWidth || 400;
  const height = 220; 
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  // 2. Escalas (Usando seus dados 'planets' e 'mass')
  const yScale = d3.scaleLog()
    .domain([0.1, d3.max(planets, d => d.mass)])
    .range([height - margin.bottom, margin.top]);

  const xScale = d3.scaleBand()
    .domain(planets.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible")
    .style("display", "block");

  // 3. Eixos com estilo refinado
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(3, ".1f"))
    .call(g => {
      g.selectAll("text").attr("fill", "#888").style("font-size", "10px");
      g.select(".domain").attr("stroke", "#444");
      g.selectAll("line").attr("stroke", "#222");
    });

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .call(g => {
      g.selectAll("text").attr("fill", "#bbb").style("font-size", "10px");
      g.select(".domain").attr("stroke", "#444");
    });

  // 4. Grupos de Barras
  const planetGroups = svg.selectAll("g.planet-bar-group")
    .data(planets)
    .join("g")
    .attr("class", "planet-bar-group");

  // Barras Visíveis
  planetGroups.append("rect")
    .attr("class", "visible-bar")
    .attr("x", d => xScale(d.name))
    .attr("y", d => yScale(d.mass))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - margin.bottom - yScale(d.mass))
    .attr("fill", d => d.name === focusPlanetName ? d.color : "#808080")
    .attr("fill-opacity", 0.7)
    .attr("stroke", d => d.name === focusPlanetName ? d.color : "none")
    .attr("stroke-width", 1.5)
    .style("transition", "fill 0.2s, stroke 0.2s, fill-opacity 0.2s");

  // 5. Tooltip Global
  const tooltip = d3.select("body").selectAll(".mass-tooltip").data([null]).join("div")
    .attr("class", "mass-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(0,0,0,0.95)")
    .style("color", "white")
    .style("padding", "8px 12px")
    .style("border", "1px solid #444")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("z-index", "3000");

  // 6. Camada de Interação (Overlays Transparentes)
  planetGroups.append("rect")
    .attr("x", d => xScale(d.name) - (xScale.step() * xScale.paddingInner() / 2))
    .attr("y", margin.top)
    .attr("width", xScale.step())
    .attr("height", height - margin.top - margin.bottom)
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(`<strong>${d.name}</strong><br>Massa: ${d.mass.toLocaleString()} × 10²⁴ kg`);
      
      d3.select(event.currentTarget.parentNode).select(".visible-bar")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("fill-opacity", 1);
    })
    .on("mousemove", (event) => {
      tooltip.style("top", (event.pageY - 45) + "px")
             .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", (event, d) => {
      tooltip.style("visibility", "hidden");
      const isFocus = d.name === focusPlanetName;
      d3.select(event.currentTarget.parentNode).select(".visible-bar")
        .attr("stroke", isFocus ? d.color : "none")
        .attr("stroke-width", isFocus ? 1.5 : 0)
        .attr("fill-opacity", 0.7);
    });

  return svg.node();
}

// Célula 23.3: [Gráfico de linha orbital] ====================================================

createOrbitLineChart = (focusPlanetName, containerWidth) => {
  // 1. Configurações de Dimensão Adaptáveis
  const width = containerWidth || 400;
  const height = 220; 
  const margin = { top: 30, right: 30, bottom: 40, left: 60 };

  const maxOrbitKM = 4.5e9;

  // 2. Escalas (Usando seus dados 'planets')
  const yScale = d3.scaleLinear()
    .domain([0, maxOrbitKM])
    .range([height - margin.bottom, margin.top]);

  const xScale = d3.scalePoint()
    .domain(planets.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.5);

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible")
    .style("display", "block");

  // 3. Eixos com formatação em Bilhões (Estilo do colega)
  const yTickValues = [0, 1.5e9, 3e9, 4.5e9];
  const yAxis = d3.axisLeft(yScale)
    .tickValues(yTickValues)
    .tickFormat(d => d === 0 ? "0" : (d / 1e9).toFixed(1) + "B km");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .call(g => {
      g.selectAll("text").attr("fill", "#888").style("font-size", "9px");
      g.selectAll("line").attr("stroke", "#222");
      g.select(".domain").attr("stroke", "#444");
      // Linhas de grade horizontais
      g.selectAll(".tick line")
        .attr("x2", width - margin.left - margin.right)
        .attr("stroke-opacity", 0.1);
    });

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .call(g => {
      g.selectAll("text").attr("fill", "#bbb").style("font-size", "9px");
      g.select(".domain").attr("stroke", "#444");
    });

  // 4. Linha Orbital
  svg.append("path")
    .datum(planets)
    .attr("fill", "none")
    .attr("stroke", "#333")
    .attr("stroke-width", 2)
    .attr("d", d3.line()
      .x(d => xScale(d.name))
      .y(d => yScale(d.orbit))
    );

  // 5. Pontos e Brilho de Foco
  const dots = svg.append("g")
    .selectAll("circle")
    .data(planets)
    .join("circle")
    .attr("class", "visible-dot")
    .attr("cx", d => xScale(d.name))
    .attr("cy", d => yScale(d.orbit))
    .attr("r", 4)
    .attr("fill", d => d.name === focusPlanetName ? d.color : "#444")
    .attr("stroke", d => d.name === focusPlanetName ? d.color : "#666")
    .attr("stroke-width", d => d.name === focusPlanetName ? 2 : 1)
    .attr("fill-opacity", d => d.name === focusPlanetName ? 1 : 0.5);

  // Aro de destaque para o planeta focado
  const focusData = planets.find(p => p.name === focusPlanetName);
  if (focusData) {
    svg.append("circle")
      .attr("cx", xScale(focusData.name))
      .attr("cy", yScale(focusData.orbit))
      .attr("r", 10)
      .attr("fill", "none")
      .attr("stroke", focusData.color)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "2,2")
      .style("filter", "drop-shadow(0 0 3px " + focusData.color + ")");
  }

  // 6. Tooltip Global
  const tooltip = d3.select("body").selectAll(".orbit-tooltip").data([null]).join("div")
    .attr("class", "orbit-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(0,0,0,0.95)")
    .style("color", "white")
    .style("padding", "8px 12px")
    .style("border", "1px solid #444")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("z-index", "3000");

  // 7. Camada de Interação (Zonas de Captura Verticais)
  const step = (width - margin.left - margin.right) / (planets.length - 1 || 1);

  svg.append("g")
    .selectAll("rect")
    .data(planets)
    .join("rect")
    .attr("x", d => xScale(d.name) - step / 2)
    .attr("y", 0)
    .attr("width", step)
    .attr("height", height)
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(`<strong>${d.name}</strong><br>Distância: ${(d.orbit / 1e6).toFixed(1)} mi km`);

      svg.selectAll(".visible-dot")
        .filter(p => p.name === d.name)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("fill-opacity", 1);
    })
    .on("mousemove", (event) => {
      tooltip.style("top", (event.pageY - 45) + "px")
             .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", (event, d) => {
      tooltip.style("visibility", "hidden");
      const isFocus = d.name === focusPlanetName;
      svg.selectAll(".visible-dot")
        .filter(p => p.name === d.name)
        .attr("stroke", isFocus ? d.color : "#666")
        .attr("stroke-width", isFocus ? 2 : 1)
        .attr("fill-opacity", isFocus ? 1 : 0.5);
    });

  return svg.node();
}

// Célula 23.4: [Gráfico de barras horizontais] ===============================================

createHorizontalBarChart = (focusPlanetName, containerWidth) => {
  // 1. Configurações de Dimensão Adaptáveis
  const width = containerWidth || 400;
  const height = 250; 
  const margin = { top: 10, right: 50, bottom: 40, left: 80 };

  // 2. Ordenação e Escalas (Usando seu array 'planets' e 'period')
  const data = [...planets].sort((a, b) => a.period - b.period);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.period)])
    .range([0, width - margin.left - margin.right]);

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([height - margin.top - margin.bottom, 0])
    .padding(0.2);

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("display", "block")
    .style("overflow", "visible");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 3. Eixos
  g.append("g")
    .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(4).tickFormat(d => `${d.toLocaleString()}d`))
    .call(g => g.selectAll("text").attr("fill", "#666").style("font-size", "10px"))
    .call(g => g.select(".domain").attr("stroke", "#333"));

  g.append("g")
    .call(d3.axisLeft(yScale))
    .call(g => g.selectAll("text").attr("fill", "#bbb").style("font-size", "10px"))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").remove());

  // 4. Tooltip Global
  const tooltip = d3.select("body").selectAll(".chart-tooltip").data([null]).join("div")
    .attr("class", "chart-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(0,0,0,0.95)")
    .style("color", "white")
    .style("padding", "8px 12px")
    .style("border", "1px solid #444")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("z-index", "3000");

  // 5. Camada de Interação (Grupos por Planeta)
  const interactionGroups = g.selectAll(".interact-group")
    .data(data)
    .join("g")
    .attr("class", "interact-group");

  // Barras Visíveis
  interactionGroups.append("rect")
    .attr("class", "visible-bar")
    .attr("x", 0)
    .attr("y", d => yScale(d.name))
    .attr("height", yScale.bandwidth())
    .attr("width", d => xScale(d.period))
    .attr("fill", d => d.name === focusPlanetName ? d.color : "#333")
    .attr("fill-opacity", d => d.name === focusPlanetName ? 1 : 0.6)
    .style("transition", "fill 0.2s, stroke 0.2s");

  // Retângulos de Captura (Invisíveis e largos para facilitar o hover)
  interactionGroups.append("rect")
    .attr("x", 0)
    .attr("y", d => yScale(d.name))
    .attr("width", width - margin.left - margin.right)
    .attr("height", yScale.bandwidth())
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("mouseover", (event, d) => {
      const isFocus = d.name === focusPlanetName;
      
      d3.select(event.currentTarget.parentNode).select(".visible-bar")
        .attr("fill", isFocus ? d.color : "#666")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("fill-opacity", 1);

      tooltip.style("visibility", "visible")
        .html(`<strong>${d.name}</strong><br>Translação: ${d.period.toLocaleString()} dias`);
    })
    .on("mousemove", (event) => {
      tooltip.style("top", (event.pageY - 45) + "px")
             .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", (event, d) => {
      const isFocus = d.name === focusPlanetName;
      
      d3.select(event.currentTarget.parentNode).select(".visible-bar")
        .attr("fill", isFocus ? d.color : "#333")
        .attr("stroke", "none")
        .attr("fill-opacity", isFocus ? 1 : 0.6);

      tooltip.style("visibility", "hidden");
    });

  return svg.node();
}

// Célula 25: [Mission Planner] ===============================================================

// Célula 25.1: [Física Orbital] ==============================================================

orbitalPhysics = {
  const muSun = 0.000295912208; // AU³/dia²

  function calculateHohmann(r1, r2) {
    const aTrans = (r1 + r2) / 2;
    const v1 = Math.sqrt(muSun / r1);
    const v2 = Math.sqrt(muSun / r2);
    const vTrans1 = Math.sqrt(muSun * (2 / r1 - 1 / aTrans));
    const vTrans2 = Math.sqrt(muSun * (2 / r2 - 1 / aTrans));
    
    const deltaV1 = Math.abs(vTrans1 - v1);
    const deltaV2 = Math.abs(v2 - vTrans2);
    const transferTime = Math.PI * Math.sqrt(Math.pow(aTrans, 3) / muSun);
    const omega2 = Math.sqrt(muSun / Math.pow(r2, 3));
    const phaseAngle = (180 - omega2 * transferTime * (180 / Math.PI)) % 360;

    return { deltaV1, deltaV2, transferTime, phaseAngle, aTrans, e: Math.abs(r1 - r2) / (r1 + r2) };
  }

  function getLaunchWindow(currentAngle, idealAngle, r1, r2) {
    const n1 = Math.sqrt(muSun / Math.pow(r1, 3));
    const n2 = Math.sqrt(muSun / Math.pow(r2, 3));
    const relativeVelocity = Math.abs(n1 - n2);
    let diffRad = (idealAngle - currentAngle) * (Math.PI / 180);
    while (diffRad < 0) diffRad += 2 * Math.PI;
    return diffRad / relativeVelocity; // Retorna dias
  }

  return { calculateHohmann, getLaunchWindow };
}

// Célula 25.2: [Estado da Missão] ============================================================

mutable mission = null;

// Célula 25.3: [Lógica da Rota de Transferência] =============================================

transferData = {
  if (!mission) return null;

  const p1 = planets.find(p => p.name === mission.origin);
  const p2 = planets.find(p => p.name === mission.target);
  
  if (!p1 || !p2) return null;

  const r1 = p1.a_AU;
  const r2 = p2.a_AU;
  const aTrans = (r1 + r2) / 2;
  const e = Math.abs(r1 - r2) / (r1 + r2);

  // Cálculo robusto do ângulo de fase ideal
  // Para planetas externos: 180 * (1 - (aTrans/r2)^1.5)
  // Para planetas internos: 180 * (1 + (aTrans/r2)^1.5) -> ou similar
  const phaseAngle = (180 * (1 - Math.pow(aTrans / r2, 1.5))) % 360;

  // IMPORTANTE: Inverter o sinal do ângulo se estiver voltando (r1 > r2)
  const correctedPhaseAngle = r1 < r2 ? (phaseAngle + 360) % 360 : (360 - phaseAngle);

  const transferTime = 365.25 * 0.5 * Math.pow(aTrans, 1.5);

  return { p1, p2, aTrans, e, phaseAngle: correctedPhaseAngle, r1, r2, transferTime };
}