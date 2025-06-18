// Variáveis globais para elementos e estado do jogo
let plane; // O objeto que representa o avião/humano
let city; // O objeto que representa a cidade
let field; // O objeto que representa o campo
let landingArea; // Novo: Objeto que representa a área de pouso
let bridge; // Novo: Objeto que representa a ponte
let sprayParticles = []; // Array para armazenar as partículas de pulverização
let isSpraying = false; // Flag para controlar se está pulverizando
let score = 0; // Atualmente não usado, mas pode ser expandido
let velocityX = 0; // Velocidade horizontal do avião/humano
let velocityY = 0; // Velocidade vertical do avião
const acceleration = 0.3; // Quão rápido o avião/humano acelera
const friction = 0.97; // Quão rápido o avião/humano desacelera devido ao atrito
let gameState = 'start'; // Estado atual do jogo: 'start', 'playing', 'end'
let planeImage; // Variável para armazenar a imagem do avião
let humanImage; // Novo: Variável para armazenar a imagem do humano
let propellerAngle = 0; // Ângulo para a hélice rotativa
let plants = []; // Array para armazenar as plantas crescendo
const maxPlants = 50; // Número máximo de plantas permitidas no campo (aumentado!)
let weDidItVisible = false; // Flag para controlar a visibilidade da mensagem "Conseguimos!"

/**
 * Pré-carrega assets como imagens antes da configuração.
 * A imagem 'plane.png' é carregada aqui.
 */
function preload() {
 planeImage = loadImage("avioa.gif"); 
 humanImage = loadImage("piloto do aviao.gif"); 
}

/**
 * Configura o canvas e inicializa os objetos do jogo.
 * Chamado uma vez no início.
 */
function setup() {
 createCanvas(800, 600); // Cria um canvas de tamanho fixo
 plane = new Plane();
 city = new City();
 field = new Field();
 // Inicializa os objetos da área de pouso e da ponte
 // MODIFICADO: A área de pouso agora é colocada dentro da cidade
 landingArea = new LandingArea(city.x + city.width - 150, height - 40, 100, 40); // X ajustado para ficar na cidade
 bridge = new Bridge(city.width, height - 100, field.x - city.width, 20); // Conecta a cidade e o campo
 gameState = 'start';
}

/**
 * O loop principal de desenho, chamado continuamente.
 * Lida com o estado do jogo, atualizações e renderização.
 */
function draw() {
 background(135, 206, 235); // Cor de fundo azul céu

 if (gameState === 'start') {
  showStartScreen(); // Exibe a tela de início
 } else if (gameState === 'playing') {
  city.show(); // Desenha a cidade
  field.show(); // Desenha o campo
  landingArea.show(); // Mostra a área de pouso
  bridge.show(); // Mostra a ponte

  // Movimento contínuo baseado nas teclas de seta pressionadas
  // MODIFICADO: Apenas aplica aceleração vertical se for um avião
  if (keyIsDown(UP_ARROW)) {
   if (!plane.isHuman) {
    velocityY -= acceleration;
   }
  }
  if (keyIsDown(DOWN_ARROW)) {
   if (!plane.isHuman) {
    velocityY += acceleration;
   }
  }
  // MODIFICADO: Aplica aceleração horizontal independentemente da forma
  if (keyIsDown(LEFT_ARROW)) {
   velocityX -= acceleration;
  }
  if (keyIsDown(RIGHT_ARROW)) {
   velocityX += acceleration;
  }

  plane.update(); // Atualiza a posição e o estado do avião/humano
  plane.show(); // Desenha o avião/humano

  // Lida com a pulverização (somente se for um avião)
  if (isSpraying) {
   plane.spray();
  }

  // Atualiza e mostra as partículas de pulverização
  for (let i = sprayParticles.length - 1; i >= 0; i--) {
   sprayParticles[i].update();
   sprayParticles[i].show();
   if (sprayParticles[i].isOffscreen()) {
    sprayParticles.splice(i, 1); // Remove partículas fora da tela
   }
   // Verifica se uma partícula de pulverização atinge uma planta (colisão simples para demonstração)
   // Isso é uma verificação básica e pode ser melhorada
   for (let j = 0; j < plants.length; j++) {
    let d = dist(sprayParticles[i].x, sprayParticles[i].y, plants[j].x, plants[j].y);
    if (d < plants[j].size / 2) {
     // Você poderia adicionar pontuação ou outros efeitos aqui se uma partícula "atingir" uma planta
    }
   }
  }

  // Atualiza e desenha as plantas
  for (let i = 0; i < plants.length; i++) {
   plants[i].update(); // Atualiza o estágio de crescimento da planta
   plants[i].show(); // Desenha a planta
  }

  // Verifica a conclusão da pulverização. Transiciona para o estado 'end' quando a pulverização estiver concluída e não houver mais partículas.
  // Esta condição pode precisar de ajuste dependendo do objetivo do jogo com a transformação humana.
  if (plane.x > field.x + field.width && isSpraying && sprayParticles.length === 0) {
   // Por enquanto, mantenha-o como uma condição final de fallback relacionada à pulverização
   // Se o objetivo for pousar, isso pode mudar.
   // gameState = 'end';
  }

  // Mensagem para solicitar ao usuário que pulverize quando estiver sobre o campo (somente se for um avião)
  if (plane.x > field.x && plane.x < field.x + field.width && !isSpraying && !plane.isHuman) {
   textSize(32);
   fill(0);
   textAlign(CENTER);
   text("Pressione ESPAÇO para polvilhar!", width / 2, height / 2 - 50);
   textAlign(LEFT); // Redefine o alinhamento do texto
  }

  // Exibe a mensagem "Conseguimos!" quando o humano atinge a ponte
  if (weDidItVisible) {
   textSize(48);
   fill(0);
   textAlign(CENTER, CENTER);
   text("Conseguimos!", width / 2, height / 2 - 80);
   textAlign(LEFT, BASELINE); // Redefine o alinhamento do texto
  }
 } else if (gameState === 'end') {
  showEndScreen(); // Exibe a tela final
 }

 // Opcional: Exibir pontuação
 // textSize(20);
 // fill(0);
 // text("Score: " + score, 20, 30);
}

/**
 * Lida com o pressionar das teclas para interações do jogo.
 */
function keyPressed() {
 if (gameState === 'start' && keyCode === ENTER) {
  gameState = 'playing'; // Inicia o jogo com a tecla ENTER
 } else if (gameState === 'playing') {
  // Começa a pulverizar se a BARRA DE ESPAÇO for pressionada e o avião estiver sobre o campo (somente se for um avião)
  if (keyCode === 32 && plane.x > field.x && plane.x < field.x + field.width && !plane.isHuman) {
   isSpraying = true;
  }
  // Sai do avião (transforma em humano) com a tecla "E"
  if (keyCode === 69 && !plane.isHuman && plane.x > landingArea.x && plane.x < landingArea.x + landingArea.width &&
   plane.y + plane.size / 2 >= landingArea.y - 10 && plane.y + plane.size / 2 <= landingArea.y + landingArea.height + 10 &&
   abs(velocityX) < 1 && abs(velocityY) < 1) {
   plane.isHuman = true;
   plane.y = landingArea.y - plane.humanSize / 2;
   velocityX = 0; // Redefine a velocidade horizontal ao transformar
   velocityY = 0; // Redefine a velocidade vertical ao transformar
   weDidItVisible = true; // Define "Conseguimos!" como visível ao pressionar 'E' para transformação
  }
 } else if (gameState === 'end' && keyCode === 82) { // 'R' para reiniciar
  resetGame(); // Redefine o estado do jogo
  gameState = 'playing'; // Volta para o estado de jogo
 }
}

/**
 * Redefine todas as variáveis do jogo para o estado inicial para um novo jogo.
 */
function resetGame() {
 plane = new Plane();
 sprayParticles = [];
 isSpraying = false;
 velocityX = 0;
 velocityY = 0;
 score = 0;
 plants = []; // Limpa todas as plantas ao reiniciar o jogo
 weDidItVisible = false; // Redefine a flag da mensagem
}

/**
 * Exibe a tela inicial.
 */
function showStartScreen() {
 background(135, 206, 235); // Cor de fundo azul céu
 fill(0); // Texto preto
 textSize(48);
 textAlign(CENTER, CENTER); // Centraliza o texto horizontal e verticalmente
 text("Montar o Avião!", width / 2, height / 2 - 50);

 textSize(24);
 text("Pressione ENTER para começar", width / 2, height / 2 + 20);
 textAlign(LEFT, BASELINE); // Redefine o alinhamento do texto
}

/**
 * Exibe a tela final após a conclusão da missão.
 */
function showEndScreen() {
 background(135, 206, 235); // Cor de fundo azul céu
 fill(0); // Texto preto
 textSize(48);
 textAlign(CENTER, CENTER); // Centraliza o texto horizontal e verticalmente
 text("Missão Concluída!", width / 2, height / 2 - 50);

 textSize(24);
 text("Pressione R para reiniciar", width / 2, height / 2 + 20);
 textAlign(LEFT, BASELINE); // Redefine o alinhamento do texto
}

/**
 * Representa o avião do jogador, que pode se transformar em um humano.
 */
class Plane {
 constructor() {
  this.x = 50;
  this.y = height / 2;
  this.size = 50; // Tamanho quando está na forma de avião
  this.humanSize = 100; // Tamanho quando está na forma humana
  this.propellerSize = 10;
  this.isHuman = false; // Novo estado: true se transformado em humano
 }

 /**
  * Atualiza a posição do avião/humano e lida com a lógica de transformação.
  */
 update() {
  if (!this.isHuman) {
   // Lógica de movimento do avião
   this.x += velocityX;
   this.y += velocityY;
   velocityX *= friction;
   velocityY *= friction;

   // Restringe o avião dentro dos limites do canvas
   this.y = constrain(this.y, this.size / 2, height - this.size / 2);
   this.x = constrain(this.x, this.size / 2, width - this.size / 2);

   // Detecção de pouso: Verifica se o avião está sobre a área de pouso E perto de sua superfície superior E movendo-se lentamente
   if (this.x > landingArea.x && this.x < landingArea.x + landingArea.width &&
    this.y + this.size / 2 >= landingArea.y - 10 && this.y + this.size / 2 <= landingArea.y + landingArea.height + 10 && // Detecção Y expandida ligeiramente
    abs(velocityX) < 1 && abs(velocityY) < 1) { // Limiar de velocidade para um pouso "suave"
    // Permite a transformação com a tecla "E" na função keyPressed()
   }
  } else {
   // Lógica de movimento humano (principalmente horizontal, posição Y fixa no chão)
   this.x += velocityX;
   velocityX *= friction;
   // MODIFICADO: A posição Y do humano é fixa no chão. Sem movimento vertical para o humano.
   this.y = height - this.humanSize / 7 - 7; // Y fixo para humano, ligeiramente acima da borda inferior

   // Restringe o humano dentro dos limites do canvas
   this.x = constrain(this.x, this.humanSize / 2, width - this.humanSize / 2);

   // Verifica se o humano alcançou a ponte
   if (this.x > bridge.x && this.x < bridge.x + bridge.width) {
    weDidItVisible = true; // Mostra a mensagem "Conseguimos!"
   } else {
    weDidItVisible = false; // Esconde a mensagem se o humano não estiver na ponte
   }

   // Detecção de decolagem: Se o humano se afastar o suficiente da área de pouso, transforma de volta em avião
   // Isso fornece uma maneira simples de voltar à forma de avião.
   if (this.x < landingArea.x - this.humanSize * 2 || this.x > landingArea.x + landingArea.width + this.humanSize * 2) {
    this.isHuman = false;
    // Ao transformar de volta em avião, redefine y para uma altura de voo para evitar um re-pouso imediato
    this.y = height / 2;
   }
  }
 }

 /**
  * Exibe o avião ou o personagem humano com base no estado atual.
  */
 show() {
  push();
  translate(this.x, this.y); // Centraliza o desenho em torno de this.x, this.y

  if (!this.isHuman) {
   // Desenha o avião
   if (planeImage) {
    image(planeImage, -this.size / 2, -this.size / 2, this.size, this.size);
   } else {
    // Desenho de fallback para o avião
    fill(200, 0, 0);
    rect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
    fill(150);
    rect(-this.size, -this.size * 0.1, this.size * 2, this.size * 0.2);
   }

   // Desenha e gira a hélice apenas se for um avião
   push();
   translate(this.size / 2, 0); // Translada para a frente do avião para a hélice
   rotate(propellerAngle);
   fill(100);
   ellipse(0, 0, this.propellerSize, this.propellerSize / 2);
   line(0, 0, this.propellerSize * 1.5, 0);
   pop();
   propellerAngle += 0.2; // Atualiza o ângulo da hélice para rotação
  } else {
   // Desenha o humano
   if (humanImage) {
    image(humanImage, -this.humanSize / 2, -this.humanSize / 2, this.humanSize, this.humanSize);
   } else {
    // Desenho de fallback para o humano
    fill(0, 120, 200); // Forma humana azul
    ellipse(0, -this.humanSize * 0.2, this.humanSize * 0.8, this.humanSize * 0.8); // Corpo
    ellipse(0, -this.humanSize * 0.8, this.humanSize * 0.4, this.humanSize * 0.4); // Cabeça
    rect(-this.humanSize * 0.1, this.humanSize * 0.1, this.humanSize * 0.2, this.humanSize * 0.5); // Pernas
   }
  }
  pop(); // Finaliza as transformações para este objeto
 }

 /**
  * Gera partículas de pulverização e cria plantas quando sobre o campo, respeitando o limite de plantas.
  * Pulveriza apenas se o personagem estiver na forma de avião.
  */
 spray() {
  if (!this.isHuman) { // Apenas pulveriza se for um avião
   // Cria partículas de pulverização para efeito visual
   for (let i = 0; i < 5; i++) {
    let angle = random(-PI / 8, PI / 8) + PI / 2; // Pulveriza para baixo
    let vx = cos(angle) * 2;
    let vy = sin(angle) * 2;
    sprayParticles.push(new Particle(this.x + this.size / 2, this.y, vx, vy));
   }

   // Apenas cria uma nova planta se o avião estiver sobre o campo E a contagem atual de plantas estiver abaixo do limite.
   // Isso adiciona uma planta por ação de pulverização para ajudar a distribuí-las e evitar o preenchimento instantâneo.
   if (this.x > field.x && this.x < field.x + field.width && plants.length < maxPlants) {
    let plantType = floor(random(3)); // Escolhe aleatoriamente o tipo de planta (0: flor, 1: arbusto, 2: árvore pequena)
    // Randomiza a posição X mais amplamente dentro da área de pulverização para espalhar as plantas
    let plantX = this.x + random(-this.size * 1.5, this.size * 1.5); // Aumento significativo na dispersão!
    plants.push(new Plant(plantX, this.y, plantType));
   }
  }
 }
}

/**
 * Representa o elemento de fundo da cidade.
 */
class City {
 constructor() {
  this.x = 0; // A cidade começa na borda esquerda
  this.y = height - 100; // A base da cidade fica a 100 pixels da parte inferior
  this.width = 400; // Largura da área da cidade
  this.buildingColor = [100, 100, 100]; // Cor cinza para os edifícios
 }

 /**
  * Exibe os edifícios da cidade, luzes e áreas verdes.
  */
 show() {
  // Bloco base da cidade (terreno para edifícios)
  fill(this.buildingColor);
  rect(this.x, this.y, this.width, 100);

  // Edifícios com alturas e posições variadas
  fill(80); // Cinza mais escuro para os edifícios
  rect(this.x + 50, this.y - 50, 40, 50); // Edifício 1
  rect(this.x + 150, this.y - 80, 60, 80); // Edifício 2 (o mais alto)
  rect(this.x + 250, this.y - 30, 30, 30); // Edifício 3
  rect(this.x + 350, this.y - 60, 50, 60); // Edifício 4

  // Adiciona luzes aos edifícios (retângulos amarelos/laranjas)
  fill(255, 200, 0, 200); // Amarelo/Laranja, ligeiramente transparente
  // Luzes para o Edifício 1
  rect(this.x + 55, this.y - 45, 8, 8);
  rect(this.x + 65, this.y - 45, 8, 8);
  rect(this.x + 55, this.y - 35, 8, 8);
  rect(this.x + 65, this.y - 35, 8, 8);

  // Luzes para o Edifício 2
  rect(this.x + 155, this.y - 75, 10, 10);
  rect(this.x + 170, this.y - 75, 10, 10);
  rect(this.x + 185, this.y - 75, 10, 10);
  rect(this.x + 155, this.y + -60, 10, 10);
  rect(this.x + 170, this.y + -60, 10, 10);
  rect(this.x + 185, this.y + -60, 10, 10);

  // Luzes para o Edifício 3
  rect(this.x + 253, this.y - 27, 6, 6);
  rect(this.x + 263, this.y - 27, 6, 6);

  // Luzes para o Edifício 4
  rect(this.x + 355, this.y - 55, 9, 9);
  rect(this.x + 370, this.y - 55, 9, 9);
  rect(this.x + 355, this.y - 40, 9, 9);

  // Adiciona áreas verdes (parques) dentro da cidade
  fill(0, 150, 0); // Cor verde para parques
  rect(this.x + 10, this.y + 70, 30, 20); // Pequeno parque à esquerda
  rect(this.x + 110, this.y + 60, 50, 30); // Parque maior
  rect(this.x + 280, this.y + 75, 40, 15); // Outro pequeno parque
 }
}

/**
 * Representa o campo onde as plantas crescerão.
 */
class Field {
 constructor() {
  this.x = 500; // O campo começa após a cidade
  this.y = height - 80; // A base do campo fica a 80 pixels da parte inferior
  this.width = 300; // Largura do campo
  this.height = 80; // Altura do campo
  this.color = [124, 252, 0]; // Cor verde gramado
 }

 /**
  * Exibe o campo.
  */
 show() {
  fill(this.color);
  rect(this.x, this.y, this.width, this.height);
 }
}

/**
 * Representa uma área de pouso dedicada para o avião se transformar.
 */
class LandingArea {
 constructor(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = [150, 150, 150]; // Cinza para a superfície da pista
 }

 /**
  * Exibe a área de pouso com marcações simples.
  */
 show() {
  fill(this.color);
  rect(this.x, this.y, this.width, this.height);
  // Adiciona algumas marcações de pista
  stroke(255); // Linhas brancas
  strokeWeight(2);
  // Linha central
  line(this.x + 10, this.y + this.height / 2, this.x + this.width - 10, this.y + this.height / 2);
  // Linhas das bordas
  line(this.x + 10, this.y + 5, this.x + this.width - 10, this.y + 5);
  line(this.x + 10, this.y + this.height - 5, this.x + this.width - 10, this.y + this.height - 5);
  noStroke();
  fill(255, 200, 0); // Luzes amarelas nas extremidades
  ellipse(this.x + 5, this.y + this.height / 2, 5);
  ellipse(this.x + this.width - 5, this.y + this.height / 2, 5);
 }
}

/**
 * Representa uma ponte que conecta a cidade e o campo.
 */
class Bridge {
 constructor(x, y, width, height) {
  this.x = x;
  this.y = y; // A ponte começa mais alta que o nível do solo
  this.width = width;
  this.height = height;
  this.color = [139, 69, 19]; // Cor marrom para a estrutura da ponte
 }

 /**
  * Exibe a ponte com um corrimão simples.
  */
 show() {
  fill(this.color);
  rect(this.x, this.y, this.width, this.height);
  // Adiciona algum corrimão/estrutura para a ponte
  stroke(100); // Cinza mais escuro para o corrimão
  strokeWeight(2);
  // Suportes verticais
  line(this.x, this.y, this.x, this.y + this.height);
  line(this.x + this.width, this.y, this.x + this.width, this.y + this.height);
  // Corrimão horizontal
  line(this.x, this.y + this.height / 2 - 5, this.x + this.width, this.y + this.height / 2 - 5);
  line(this.x, this.y + this.height / 2 + 5, this.x + this.width, this.y + this.height / 2 + 5);
  noStroke();
 }
}

/**
 * Representa uma única partícula de pulverização do avião.
 */
class Particle {
 constructor(x, y, vx, vy) {
  this.x = x; // Posição X inicial
  this.y = y; // Posição Y inicial
  this.vx = vx; // Velocidade X
  this.vy = vy; // Velocidade Y
  this.alpha = 255; // Opacidade da partícula
  this.size = 5; // Tamanho da partícula
 }

 /**
  * Atualiza a posição da partícula e a faz desaparecer.
  */
 update() {
  this.x += this.vx;
  this.y += this.vy;
  this.alpha -= 5; // Diminui a opacidade
 }

 /**
  * Exibe a partícula de pulverização.
  */
 show() {
  noStroke(); // Sem contorno para partículas
  fill(0, 100, 255, this.alpha); // Cor azul, desaparecendo
  ellipse(this.x, this.y, this.size); // Desenha um círculo
 }

 /**
  * Verifica se a partícula desapareceu.
  * @returns {boolean} Verdadeiro se a partícula não estiver mais visível.
  */
 isOffscreen() {
  return this.alpha <= 0;
 }
}

/**
 * Representa uma planta que cresce no campo.
 */
class Plant {
 constructor(x, y, type) {
  this.x = x;
  // Ajusta y para ficar na parte inferior do campo para visualização adequada, ligeiramente aleatorizado
  this.y = field.y + field.height - random(5, 15);
  this.type = type; // 0: flor, 1: arbusto, 2: árvore pequena
  this.initialSize = 5; // Tamanho inicial da planta
  this.size = this.initialSize; // Tamanho atual, vai crescer
  this.color = [0, 150, 0]; // Cor verde padrão para plantas
  this.growthStage = 0; // 0: semente, 1: broto, 2: planta jovem, 3: planta madura
  this.maxGrowthStage = 3; // Estágio máximo de crescimento
  this.growthRate = 0.005; // Taxa na qual a planta cresce
 }

 /**
  * Atualiza o estágio de crescimento e o tamanho da planta.
  * O crescimento ocorre apenas se a planta estiver dentro dos limites do campo e ainda não estiver totalmente crescida.
  */
 update() {
  // Cresce apenas se estiver dentro dos limites do campo e não no estágio máximo de crescimento
  if (this.growthStage < this.maxGrowthStage && this.x > field.x && this.x < field.x + field.width) {
   this.growthStage += this.growthRate; // Aumenta o estágio de crescimento
   // Escala o tamanho com base na progressão do crescimento
   this.size = this.initialSize + (this.growthStage / this.maxGrowthStage) * 20;
  }
 }

 /**
  * Exibe a planta com base em seu tipo e estágio de crescimento atual.
  */
 show() {
  let currentSize = this.size;

  push(); // Isola as transformações para esta planta
  translate(this.x, this.y); // Move a origem para a base da planta
  noStroke(); // Sem contorno para as formas da planta

  if (this.growthStage < 1) {
   // Estágio 0: Semente
   fill(100, 50, 0); // Cor marrom para a semente
   ellipse(0, 0, 3, 3);
  } else if (this.growthStage < 2) {
   // Estágio 1: Broto
   fill(0, 100, 0); // Verde escuro para o broto
   rect(-1, -8, 2, 8); // Linha vertical simples para o broto
  } else {
   // Estágios 2 e 3: Planta jovem ou adulta
   if (this.type === 0) { // Tipo Flor
    fill(this.color); // Caule verde
    rect(-1, -currentSize, 2, currentSize);
    fill(255, 255, 0); // Centro amarelo
    ellipse(0, -currentSize, currentSize * 0.8, currentSize * 0.8);
    fill(255, 0, 0); // Pétalas vermelhas
    for (let i = 0; i < TWO_PI; i += PI / 3) {
     ellipse(cos(i) * currentSize * 0.4, sin(i) * currentSize * 0.4 - currentSize, currentSize * 0.5, currentSize * 0.2);
    }
   } else if (this.type === 1) { // Tipo Arbusto
    fill(0, 150, 0); // Verde para o arbusto
    ellipse(0, -currentSize * 0.5, currentSize * 1.2, currentSize); // Corpo principal
    ellipse(currentSize * 0.3, -currentSize * 0.7, currentSize * 0.8, currentSize * 0.7); // Partes adicionais para a forma
    ellipse(-currentSize * 0.3, -currentSize * 0.6, currentSize * 0.9, currentSize * 0.8);
   } else { // Tipo Árvore Pequena
    fill(139, 69, 19); // Marrom para o tronco
    rect(-currentSize * 0.15, -currentSize * 1.5, currentSize * 0.3, currentSize * 1.5); // Tronco da árvore
    fill(34, 139, 34); // Verde floresta para as folhas
    ellipse(0, -currentSize * 1.7, currentSize * 1.5, currentSize * 1.5); // Copa da árvore
   }
  }
  pop(); // Restaura as transformações anteriores
 }
}