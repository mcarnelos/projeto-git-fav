import { GithubUser } from "./GithubUser.js"

//classe que vai conter a lógica dos dados
//como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  /* coloca os usuarios no storage do browser ou retorna um array vazio */
  load() {
    this.entries = JSON.parse(localStorage.getItem
      ('@github-favorites:')) || []
  }

  //salvando os entries no local storage
  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  //busca o usuário no github
  //aguarda a promessa para ser executado
  async add(username) {
    try {

      //verifica se o login é igual ao username o que significa que o usuário existe
      const userExists = this.entries.find(entry => entry.login ===username)

      if(userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

    //recriando um novo array que traz o usuário e todods os outros itens espalhados frotalecendo a imutabilidade
    this.entries = [user, ...this.entries]
    this.update()
    this.save()
    
    } catch(error) {
      alert(error.message)
    }
  }

  /* deleta o usuario filtrando pelos entries */
  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login) //tudo que for verdadeiro adiciona no array

    /* apaga o antigo array e cria um novo array */
    this.entries = filteredEntries 
    /* atualiza a lista */
    this.update()
    this.save()
  }
}

//classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
 
    this.tbody = this.root.querySelector('table .favoritos')

    this.update()
    this.onadd()
  }

  //define a funcionalidade quando clicado o botão + ele busca apenas o value que está no input
  onadd() {
    const userSearch = this.root.querySelector('.search button')
    const inputSearch = this.root.querySelector('#input-search')

    inputSearch.onkeypress = (keyPressed) => {

      if(keyPressed.key === 'Enter' || userSearch.click === 'onclick'){
        const {value} = this.root.querySelector('#input-search')

        this.add(value)
      }
    }

    userSearch.onclick = () => {
      const {value} = this.root.querySelector('#input-search')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()
 
    this.entries.forEach(user => {
      const row = this.createRow()
      
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      /* Botão deletar */
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if(isOk) {
          this.delete(user)
        }
        //verifica se a lista está vazia
        if(this.entries.length === 0) {
          this.root.querySelector('.empty').classList.remove('hide')
        }
      }
      

      this.tbody.append(row)
    })
  }  

  createRow() {
    const tr = document.createElement('tr')/* criando o tr pela DOM */

    tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/mcarnelos.png" alt="Imagem de mcarnelos">
      <a href="https://github.com/mcarnelos" target="_blank">
        <p>Murilo Carnelós</p>
        <span>mcarnelos</span>
      </a>
    </td>
    <td class="repositories">
      76
    </td>
    <td class="followers">
      9589
    </td>
    <td>
      <button class="remove">Remover</button>
    </td>
  `

    return tr
  }
    
  removeAllTr() {  

    if(this.entries.length !== 0){
      this.root.querySelector('.empty').classList.add('hide')
    }

    //pega todos os tr do tbody e para cada um deles executa a função
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }

}




