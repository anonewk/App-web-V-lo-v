// Variables globales

var newMap;
var newStation;
var newMarker;

// Objet maps  ==>  La carte Google maps ainsi que les marqueurs

var Maps = {
    lat: 45.7579341, // Lattitude de la carte
    long: 4.8552300, // Longitude de la carte
    iconBase: "images/default_marqueur.png", // Icône de marqueur par défaut
    tableauMarqueur: [], // Tableau où sera inséré les différents marqueurs, cela servira à les rassembler (marker Clusterer)
        
    // Méthode d'insertion de la carte Google
    initMap: function () {
        map = new google.maps.Map(document.getElementById('carte'), {
            center: {
                lat: this.lat,
                lng: this.long
            }, // Insertion des coordonnées de position de la carte
            zoom: 13 // Zoom de la carte
        });
    },

    // Méthode pour l'attribution d'une image de marqueur pour les stations ouverte et fermer
    iconMarqueur: function (statusStation) {
        if (statusStation === "OPEN") {
            this.iconBase = "image/icon_green.png"; // Stations Ouvertes => Marqueur vert
        } else if (statusStation === "CLOSED") {
            this.iconBase = "image/icon_red.png"; // Stations Fermer => Marqueur rouge
        }   
    },

    // Méthode d'intégration des marqueurs sur la carte Google
    initMarqueur: function (positionStation) {
        marqueur = new google.maps.Marker({
            map: map,
            icon: this.iconBase,
            position: positionStation // Positionne les marqueurs
        });
        this.tableauMarqueur.push(marqueur); // Stocke les marqueurs dans un tableau qui sera utilisé par "markerClusterer"
    },

    // Méthode pour le regroupement de marqueurs
    regroupementMarqueurs: function () {
        marqueurCluster = new MarkerClusterer(map, this.tableauMarqueur, {
            imagePath: "image/m1.png", // Icônes du markerClusterer
        });
    },

    // Street View
};
//
//// Objet Station
var Station = {
    
    // Attributs
    nom: null, // Nom de la station
    etat: null, // Etat de la station
    nbVelo: null, // Nombre(s) de vélo(s) à la station
    nbAttache: null, // Nombre(s) d'attache(s) à la station
    emplacementDonnees: document.getElementById("station_info").querySelectorAll("p"), // Endroit où les données seront insérer au HTML
    autorisation: null, // Attribut d'autorisation de réservation
    
    // Méthode Ajax qui permettra de récupérer la liste des stations Vélib'
    ajaxGet: function (url, callback) {
        req = new XMLHttpRequest(); // Création d'une requête HTTP
        req.open("GET", url); // Requête HTTP GET asynchrone
        req.addEventListener("load", function () {
            if (req.status >= 200 && req.status < 400) {
                // Appelle de "callback" en lui passant la réponse de la requête
                callback(req.responseText);
            } else {
                console.error(req.status + " " + req.statusText + " " + url);
            }
        });
        req.addEventListener("error", function () {
            console.error("Erreur réseau avec l'URL " + url);
        });
        req.send(null); // Envoi de la requête
    },

    // Méthode qui remplit les attributs de données de la station
    traitementDonneesStation: function (donneesStation) {
        // Nom
        this.nom = donneesStation.name;
        // Etat (ouvert ou fermer)
        this.etat = donneesStation.status;
        // Nombre de velo(s)
        if ((sessionStorage.getItem("minutes")) && (Compteur.nomStation === this.nom)) { // Si une réservation est en cours dans la même station
            this.nbVelo = donneesStation.available_bikes - 1; // On enlève un vélo à la station
        } else { // Sinon
            this.nbVelo = donneesStation.available_bikes; // On affiche le véritable nombre de vélos disponible
        }
        // Nombre(s) d'attache(s)
        this.nbAttache = donneesStation.available_bike_stands;
    },

    // Méthode pour insérer les données dans la page
    insertionDonneesStation: function () {
        // Insertion des données dans la page
        document.getElementById("address").innerHTML = "Nom : " + this.nom;
        document.getElementById("status").innerHTML = "Etat : " + this.etat;
        document.getElementById("places").innerHTML = "Vélos disponible : " + this.nbVelo;
        document.getElementById("availableBikes").innerHTML = "Attache disponible : " + this.nbAttache;
    },

    // Méthode qui autorise ou non la réservation
    autorisationReservation: function () {
        if (this.etat === "CLOSED") { // Si la station est fermée

            // Traduction du texte
            this.etat = "FERMER";
            // Le champ d'état de la station sera marqué en rouge
            document.getElementById("status").style.color = "red";
            // Le nombre de vélo sera marqué en rouge
            document.getElementById("places").style.color = "red";
            // Interdit la réservation
            this.autorisation = false;

        } else if (this.etat === "OPEN") { // Sinon si la Station est ouverte

            // Traduction du texte
            this.etat = "OUVERT";
            // Le champ retrouve sa couleur d'origine
            document.getElementById("status").style.color = "";
            // Autorise la réservation
            this.autorisation = true;

            if (this.nbVelo === 0) { // Si le nombre de vélos est à 0

                // Le champ sera marqué en rouge
                document.getElementById("places").style.color = "red";
                // Interdit la réservation
                this.autorisation = false;

            } else if (this.nbVelo > 0) {

                // Le champ retrouve sa couleur d'origine
                document.getElementById("places").style.color = "";

            }
        }
    }
};


// Appel de la méthode Ajax et récupération de la liste des stations

Station.ajaxGet("https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=7fe8a1f59f2bd73a2b266fc7719a0672cab45543", function (reponse) {
    listeStations = JSON.parse(reponse);

    // Parcours les données des stations
    listeStations.forEach(function (reponseInfoStation) {

        // Appel de la méthode d'attribution d'une icône de marqueur
        Maps.iconMarqueur(reponseInfoStation.status);

        // Appel de la méthode initMarqueur pour positionner les marqueurs sur la carte
        Maps.initMarqueur(reponseInfoStation.position);

        // Ajoute un événement lors du clic sur un marqueur
        google.maps.event.addListener(marqueur, "click", function () {

            // Insertion des données dans l'objet "station"
            Station.traitementDonneesStation(reponseInfoStation);

            // On cache les différentes parties de la page
            document.getElementById("messageErreur").style.display = "none"; // Les messages d'erreur
            document.getElementById("sketch").style.display = "none"; // Le Sontenant les infos de la station sélectionnée
            document.getElementById("infoStation").style.display = "block";



            // Vérification de l'autorisation de réservation
            Station.autorisationReservation();

            // Insertion des données dans le bloc
            Station.insertionDonneesStation();

        }); // Fin événement clic marqueur
    }); // Fermeture de la boucle pour le parcours des données des stations

    // Événements pour le clic sur le bouton de réservation
    
    document.getElementById("book").addEventListener("click", function (x) {
  
      
        if (Station.autorisation) { // Si l'autorisation de réservation est à true

            //Formulaire
            document.getElementById("infosPersonn").style.display = "block";

            document.getElementById("sign").addEventListener("click", function (event) {
                //Le canvas apparaît
                document.getElementById("sketch").style.display = "block";
                document.getElementById("book").style.display = "none";
                 document.getElementById("sign").style.display = "none";
                // Fait remonter la page pour voir apparaître le canvas
                event.preventDefault();
              
            });
            
            //          
                event.preventDefault();
        } else { // Si l'autorisation est à false

            // On fait apparaître le message d'erreur
            document.getElementById("messageErreur").style.display = "block";
            // Le message d'erreur disparaît au bout de 5 secondes
            setTimeout(function () {
                document.getElementById("messageErreur").style.display = "none";
            }, 5000);
        }


   
      
      });

        // Appel de la méthode "marker Clusterer"
        Maps.regroupementMarqueurs();
});
