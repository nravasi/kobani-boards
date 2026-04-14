/* Message Board - Riquelme Fan Site
   Uses localStorage to persist posts across page reloads. */

var MessageBoard = (function () {
  var STORAGE_KEY = 'riquelme_messageboard_posts';

  var SEED_POSTS = [
    { username: 'Diego_La_12', message: 'Roman sos el mas grande que vi jugar en mi vida. Esa noche contra el Real Madrid en Tokio no me la olvido mas. AGUANTE BOCA Y AGUANTE RIQUELME!!!', date: '2004-03-15T22:30:00' },
    { username: 'XeneizeMaria', message: 'La pagina esta muy linda! Roman es un genio con la pelota, ojala que nunca se vaya de Boca. Saludos desde Avellaneda!', date: '2004-03-12T18:45:00' },
    { username: 'ElTorero_10', message: 'Que crack Roman! El mejor enganche del mundo. Cuando agarra la pelota es como si el tiempo se detuviera. Nadie juega como el.', date: '2004-03-10T14:22:00' },
    { username: 'BosteroDelSur', message: 'Groso el sitio! Me acuerdo del gol de tiro libre contra Palmeiras en la Libertadores 2001... GOLAZO! La zurda magica de Roman no tiene comparacion.', date: '2004-03-08T20:15:00' },
    { username: 'CamisetaAzulYOro', message: 'Vi todos los partidos de Roman en la Bombonera. Cada vez que tocaba la pelota la gente gritaba OLEEEE. Gracias por esta pagina, esta buenisima!', date: '2004-03-05T11:03:00' },
    { username: 'Pipe_Boca_Jr', message: 'Desde Colombia les mando un saludo! Riquelme es el mejor jugador que vi en la Libertadores. Un fenomeno. Dale Boca dale!', date: '2004-03-02T09:30:00' },
    { username: 'MitadMasUno', message: 'ROMAN NO SE VA! ROMAN NO SE VA! Lo mejor que le paso a Boca despues de Maradona. Gracias por el sitio, lo agrego a mis favoritos.', date: '2004-02-28T16:44:00' },
    { username: 'LaBomboneraPalpita', message: 'Impresionante la galeria de fotos! Me emocione viendo las imagenes de la Intercontinental. Roman, sos eterno!', date: '2004-02-25T21:58:00' },
    { username: 'RomanFan_NYC', message: 'I watch every Boca game I can find on satellite TV here in New York. Riquelme has the best vision in world football right now. That no-look pass against Gremio in the Libertadores 2003 was out of this world!! Best #10 on the planet.', date: '2004-02-20T03:15:00' },
    { username: 'La_Pausa_10', message: 'Lo que mas me gusta de Roman es LA PAUSA. Todos corren como locos y el frena, levanta la cabeza, y encuentra el pase que nadie ve. Es un ajedrecista en una cancha de futbol. Eso no se enseña, se nace con eso.', date: '2004-02-15T19:40:00' },
    { username: 'BocaFan_London', message: 'Watched Riquelme at Barca and it broke my heart how they wasted him. Van Gaal never understood what a classic enganche does. So glad he is back at La Bombonera where he belongs. Pure magic every time he gets the ball.', date: '2004-02-05T12:22:00' },
    { username: 'GolazoDeRoman', message: 'Ese cano a Yepes en el superclasico!!! Se lo hizo en camara lenta y despues metio el pase gol. River no sabia que hacer con el. La Bombonera se vino abajo. IDOLO ABSOLUTO.', date: '2004-01-22T23:05:00' },
    { username: 'soccer_king_2003', message: 'Just found this site through a webring! I downloaded highlights of the 2001 Libertadores final on Kazaa and that free kick from Riquelme was INSANE. The way the ball curved around the wall... nobody in Europe can do that. Bookmarked this page!!', date: '2004-01-10T16:33:00' }
  ];

  function loadPosts() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
      return SEED_POSTS.slice();
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return SEED_POSTS.slice();
    }
  }

  function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }

  function validateField(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function validate(username, message) {
    var errors = [];
    if (!validateField(username)) {
      errors.push('El nombre es obligatorio.');
    }
    if (!validateField(message)) {
      errors.push('El mensaje es obligatorio.');
    }
    return errors;
  }

  function formatDate(isoString) {
    var d = new Date(isoString);
    var day = String(d.getDate()).padStart(2, '0');
    var months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    var month = months[d.getMonth()];
    var year = d.getFullYear();
    var hours = String(d.getHours()).padStart(2, '0');
    var mins = String(d.getMinutes()).padStart(2, '0');
    return day + '/' + month + '/' + year + ' - ' + hours + ':' + mins;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function createPostHtml(post) {
    return '<div class="message-entry">' +
      '<span class="msg-author">&#9733; ' + escapeHtml(post.username) + '</span>' +
      '<span class="msg-date">' + formatDate(post.date) + '</span>' +
      '<div class="msg-text">' + escapeHtml(post.message) + '</div>' +
      '</div>';
  }

  function addPost(username, message) {
    var errors = validate(username, message);
    if (errors.length > 0) {
      return { success: false, errors: errors };
    }
    var post = {
      username: username.trim(),
      message: message.trim(),
      date: new Date().toISOString()
    };
    var posts = loadPosts();
    posts.unshift(post);
    savePosts(posts);
    return { success: true, post: post };
  }

  function renderPosts(containerEl) {
    var posts = loadPosts();
    var html = '';
    for (var i = 0; i < posts.length; i++) {
      html += createPostHtml(posts[i]);
    }
    containerEl.innerHTML = html;
    return posts.length;
  }

  function updateStats(countEl, dateEl, count) {
    if (countEl) {
      countEl.textContent = count;
    }
    if (dateEl) {
      var posts = loadPosts();
      if (posts.length > 0) {
        dateEl.textContent = 'Ultimo mensaje: ' + formatDate(posts[0].date);
      }
    }
  }

  function init() {
    var form = document.getElementById('msg-form');
    var nameInput = document.getElementById('msg-name');
    var textInput = document.getElementById('msg-text');
    var container = document.getElementById('messages-container');
    var errorBox = document.getElementById('msg-errors');
    var countEl = document.getElementById('stats-count');
    var dateEl = document.getElementById('stats-date');

    if (!form || !container) return;

    var count = renderPosts(container);
    updateStats(countEl, dateEl, count);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var username = nameInput.value;
      var message = textInput.value;

      var result = addPost(username, message);
      if (!result.success) {
        if (errorBox) {
          errorBox.textContent = result.errors.join(' ');
          errorBox.style.display = 'block';
        }
        return;
      }

      if (errorBox) {
        errorBox.textContent = '';
        errorBox.style.display = 'none';
      }
      nameInput.value = '';
      textInput.value = '';

      count = renderPosts(container);
      updateStats(countEl, dateEl, count);
    });
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    SEED_POSTS: SEED_POSTS,
    loadPosts: loadPosts,
    savePosts: savePosts,
    validate: validate,
    validateField: validateField,
    formatDate: formatDate,
    addPost: addPost,
    renderPosts: renderPosts,
    init: init
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  MessageBoard.init();
});
