//init libr
import { Notify } from 'notiflix';
import { Spinner } from 'spin.js';
import throttle from 'lodash.throttle';
import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';
import 'spin.js/spin.css';

import FetchImages from './js/FetchImages';

const noMatchMessage =
  'Sorry, there are no images matching your search query. Please try again.';
const finMessage = "We're sorry, but you've reached the end of search results.";

//створюємо екземпляр
const fetchImages = new FetchImages();

//init spinner
const options = {
  color: 'grey',
  position: 'fixed',
  top: '50%',
  left: '50%',
};
const spinner = new Spinner(options);

let simplelightbox = null;

const formEl = document.querySelector('.search-form');
const galley = document.querySelector('.gallery');

formEl.addEventListener('submit', onHandleSubmit);

async function onHandleSubmit(e) {
  e.preventDefault();

  window.removeEventListener('scroll', onHandleScroll);

  const { searchQuery } = e.currentTarget.elements;
  fetchImages.query = searchQuery.value.trim();

  fetchImages.resetPage();
  galley.innerHTML = '';

  if (fetchImages.query === '') return;

  await fetchData()
    .catch(error => failureLog(error.message))
    .finally(() => spinner.stop());

  simplelightbox = new SimpleLightbox('.gallery a');

  window.addEventListener('scroll', throttle(onHandleScroll, 500));

  if (fetchImages.totalHits > 0) {
    Notify.info(`Hooray! We found ${fetchImages.totalHits} images.`, {
      clickToClose: true,
    });
  }
}

function onHandleScroll() {
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight
  ) {
    fetchImages.updatePage();

    const isLimit = fetchImages.totalPage > fetchImages.totalHits;

    if (isLimit) {
      failureLog(finMessage);
      return;
    }

    fetchData()
      .catch(error => failureLog(error.message))
      .finally(() => {
        spinner.stop();
        simplelightbox.refresh();
      });
  }
}

async function fetchData() {
  spinner.spin(galley);
  fetchImages.updateTotalPage();

  const { hits } = await fetchImages.getImage();
  if (hits.length === 0) {
    failureLog(noMatchMessage);
    return;
  }

  markingUp(hits);
}

//створюємо та пушимо розмітку
function markingUp(data) {
  const mark = data.reduce((acc, el) => {
    const {
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    } = el;
    acc += `<a href ="${largeImageURL}">
    <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}"  loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div></a>`;
    return acc;
  }, '');

  galley.insertAdjacentHTML('beforeEnd', mark);
}

function failureLog(message) {
  Notify.failure(message, { clickToClose: true });
}
