const cardsSection = document.querySelector('#cards');
const templateCard = document.querySelector('#templateCard').content;
const fragment = document.createDocumentFragment();
const btnPrev = document.querySelector('#prev');
const btnNext = document.querySelector('#next');
const selectTypes = document.querySelector('#selectTypes');
const select = document.querySelector('#select');

const urlAll = 'https://pokeapi.co/api/v2/pokemon/';

let next, prev;

const getPokemonData = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return { error: null, data };
  } catch (error) {
    return { error: 'Error al obtener los datos del pokemon' };
  }
};

const renderCards = (DataApi) => {
  while (cardsSection.firstChild) cardsSection.removeChild(cardsSection.firstChild);

  DataApi.results.forEach(async (pokemon) => {
    const dataPokemon = await getPokemonData(pokemon.url);
    if (!dataPokemon.error) {
      const { id, name, abilities, types, height, weight } = dataPokemon.data;

      const clone = templateCard.cloneNode(true);
      clone.querySelector('img').src =
        dataPokemon.data.sprites.other['official-artwork'].front_default || dataPokemon.data.sprites.front_default;
      clone.querySelector('h2').textContent = `${id} - ${name}`;
      clone.querySelector('span').textContent = `Altura: ${height}" - Peso: ${weight}lbs`;

      abilities.forEach((ability) => {
        const li = document.createElement('li');
        li.textContent = ability.ability.name;
        clone.querySelector('.ability ul').appendChild(li);
      });

      types.forEach((type) => {
        const li = document.createElement('li');
        li.textContent = type.type.name;
        clone.querySelector('.types ul').appendChild(li);
      });
      fragment.appendChild(clone);
    } else console.log(dataPokemon.error);

    cardsSection.appendChild(fragment);
  });
  btnPrev.disabled = !DataApi.previous;
  btnNext.disabled = !DataApi.next;
};

const getListPokemons = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    next = data.next;
    prev = data.previous;
    renderCards(data);
  } catch (error) {
    consoñe.log('Error al obtener la lista de pokemons');
  }
};

const getPokemonTypes = async () => {
  try {
    const res = await fetch('https://pokeapi.co/api/v2/type/');
    const types = await res.json();
    types.results.forEach((type) => {
      const option = document.createElement('option');
      option.textContent = type.name.toUpperCase();
      option.value = type.name;
      selectTypes.appendChild(option);
    });
  } catch (error) {
    console.log('Error al obtener los tipos de pokemon');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  getListPokemons(urlAll);
  selectTypes.disabled = true;
  getPokemonTypes();
});

select.addEventListener('change', (e) => {
  selectTypes.disabled = e.target.value !== 'types';
  select.value !== 'types' && getListPokemons(urlAll);
});

selectTypes.addEventListener('change', (e) => {
  getPokemonData(`https://pokeapi.co/api/v2/type/${selectTypes.value}/`).then((data) => {
    if (!data.error) {
      const dataObj = {
        results: data.data.pokemon.map((pokemon) => pokemon.pokemon),
        next: null,
        previous: null,
      };
      renderCards(dataObj);
    } else console.log('error', data.error);
  });
});

btnPrev.addEventListener('click', () => getListPokemons(prev));
btnNext.addEventListener('click', () => getListPokemons(next));
