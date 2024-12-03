# **Labirinto Condutivo por Inteligência Artificial**

## **Descrição**
Este projeto é uma simulação interativa que demonstra a navegação de um robô em um labirinto gerado proceduralmente, utilizando o algoritmo de Busca em Largura (**BFS**). O robô enfrenta desafios como obstáculos e energia limitada, necessitando gerenciar recursos e buscar pontos de recarga ao longo do caminho.  

O objetivo é alcançar a célula final do labirinto, explorando o menor caminho possível enquanto coleta energia para evitar falhas.

---

## **Funcionalidades**
- **Geração Procedural do Labirinto:**
  - Dimensão fixa de 10x10 células.
  - Obstáculos e pontos de energia distribuídos aleatoriamente.
  - Garantia de caminho viável entre a entrada (0,0) e a saída (9,9).

- **Navegação do Robô:**
  - Movimentos em quatro direções (cima, baixo, esquerda, direita).
  - Consumo de energia por movimento e recarga em pontos específicos.
  - Algoritmo BFS para encontrar o caminho mais eficiente.

- **Interface Gráfica:**
  - Exibição em tempo real do progresso do robô.
  - Representação visual das células do labirinto (livres, obstáculos, energia, posição do robô).
  - Painel de status com energia restante e informações do percurso.

---

## **Como Executar o Projeto**

### **Requisitos**
- Navegador atualizado com suporte a JavaScript, HTML5 e CSS3.

### **Passos para Execução**
1. Clone este repositório:
   ```bash
   git clone <URL_DO_REPOSITÓRIO>

2. Abra o arquivo index.html diretamente em um navegador.

3. Clique no botão "Iniciar Caminhada" para começar a simulação.

## Estrutura do Projeto
- index.html:
    - Contém a estrutura principal da interface do usuário e os elementos visuais do labirinto.

- script.js:
    - Implementa a lógica do sistema, incluindo a geração do labirinto e o algoritmo de navegação BFS.

- style (no index.html):
    - Controla o layout e os estilos visuais do labirinto e da interface.

# Demonstração do Algoritmo
O labirinto é gerado automaticamente com:

- Obstáculos aleatórios (10 a 25 células).
- Pontos de energia distribuídos estrategicamente (+5 e +10 unidades).
- Garantia de caminho viável por validação com BFS.

O robô:

- Move-se em busca do menor caminho até o destino.
- Coleta energia ao passar por células específicas.
- Atualiza o status visual da interface a cada movimento.