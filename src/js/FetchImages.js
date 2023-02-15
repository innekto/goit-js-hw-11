import axios from 'axios';

const URL = 'https://pixabay.com/api/';
const KEY = '32961212-2ce7a37f9a51859c3f04fb788';

//оголошуємо класс галереї
export default class FetchImages {
  constructor() {
    this.querySearch = ''; //початкове поле запиту
    this.page = 1; //початкова сторінка
    this.perPage = 40; //кількість елементів нв сторінці
    this.totalHits = null; //початкове значення повернених елементів
    this.totalPage = this.perPage;
  }

  get query() {
    return this.querySearch;
  }

  set query(newQuery) {
    this.querySearch = newQuery;
  }

  updatePage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  getPageValue() {
    return this.page;
  }

  getPerPageValue() {
    return this.perPage;
  }

  setPerPageValue(newValue) {
    this.perPage = newValue;
  }

  getTotalPage() {
    return this.totalPage;
  }

  updateTotalPage() {
    this.totalPage += this.perPage;
  }

  async getImage() {
    const params = new URLSearchParams({
      key: KEY,
      q: this.query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: this.getPageValue(),
      per_page: this.getPerPageValue(),
    });

    const { data } = await axios.get(`${URL}?${params}`);
    this.totalHits = data.totalHits;
    // console.log(this.totalHits);
    return data;
  }
}
