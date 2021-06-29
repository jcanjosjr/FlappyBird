
// uma função simples pra trabalhar de forma mais fácil com os elementos.
function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

//criando as paredes, e fazendo elas alternarem, entre a de cima e a de baixo.
function Parede(reversa = false) {
    this.elemento = novoElemento('div', 'parede')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// manipulando as paredes, e gerando uma fórmula aleatória para definir alturas.
function ParDeParedes(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-paredes')

    this.superior = new Parede(true)
    this.inferior = new Parede(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => { 
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}


//Criando a função para animar as paredes, e fazer elas se movimentarem na tela.
function Paredes(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeParedes(altura, abertura, largura),
        new ParDeParedes(altura, abertura, largura + espaco),
        new ParDeParedes(altura, abertura, largura + espaco * 2),
        new ParDeParedes(altura, abertura, largura + espaco * 3)
    ]
    
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando o elemento sair da tela
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2;
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio;
            if(cruzouOMeio) notificarPonto()
        })
    }
}

// Criando a função para movimentar o Pássaro.
function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'img/flappy.gif'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = () => voando = true 
    window.onkeyup = () => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 5 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

// Criando uma função pra contabilizar os pontos
function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }

    this.atualizarPontos(0)
}

// Função matemática para análise de colisão
function Sobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top;

    return horizontal && vertical
}

// Função para confirmar colisão
function Colisao(passaro, paredes) {
    let colidiu = false
    paredes.pares.forEach(ParDeParedes => {
        if (!colidiu) {
            const superior = ParDeParedes.superior.elemento
            const inferior = ParDeParedes.inferior.elemento
            colidiu = Sobrepostos(passaro.elemento, superior) 
                || Sobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

// Função para criar os itens das funções construtoras, e dar start no jogo.
function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const paredes = new Paredes(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos))
    
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    paredes.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // gerando o loop do jogo
        const temporizador = setInterval(() => {
            paredes.animar()
            passaro.animar()

            if (Colisao(passaro, paredes)) {
                clearInterval(temporizador)
            }
        }, 15)
    }
}

new FlappyBird().start()
