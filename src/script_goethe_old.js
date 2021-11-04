            import * as THREE from 'three';
			import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
			import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
			import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'; 

			// Daten als Array
			// aktuell zusammengebastelte Platzhalterdaten !!!

/* 			const table = [
				// receiverInitials, receiverFormatted, dateFormatted, x, y, idFormatted, Link zur Einzelansicht, gnd-link
				// Da GB01 noch nicht auf der Plattform -> überall Link auf Startseite, Beispiel aus GB02 beim ersten Zeugnis verlinkt
				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 1, 1, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", "Männlich",
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 1, 2, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", "Männlich",
				"JH", "Johann Adam Horn", "Juli 1770", 1, 3, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", "Männlich",
				"CB", "Charlotte Buff", "11. September 1772", 1, 4, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", "Weiblich",
				"JR", "Johann Gottfried Roederer", "21. September 1771", 1, 5, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", "Männlich",
				"CG", "Cornelia Goethe", "August 1767", 2, 1, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", "Weiblich",
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 2, 2, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", "Männlich",
				
				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 2, 3, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", "Männlich",
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 2, 4, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", "Männlich",
				"JH", "Johann Adam Horn", "Juli 1770", 2, 5, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", "Männlich",
				"CB", "Charlotte Buff", "11. September 1772", 3, 1, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", "Weiblich",
				"JR", "Johann Gottfried Roederer", "21. September 1771", 3, 2, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", "Männlich",
				"CG", "Cornelia Goethe", "August 1767", 3, 3, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", "Weiblich",
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 3, 4, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", "Männlich",

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 3, 5, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", "Männlich",
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 4, 1, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", "Männlich",
				"JH", "Johann Adam Horn", "Juli 1770", 4, 2, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", "Männlich",
				"CB", "Charlotte Buff", "11. September 1772", 4, 3, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", "Weiblich",
				"JR", "Johann Gottfried Roederer", "21. September 1771", 4, 4, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", "Männlich",
				"CG", "Cornelia Goethe", "August 1767", 4, 5, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", "Weiblich",
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 5, 1, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", "Männlich",

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 5, 2, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", "Männlich",
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 5, 3, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", "Männlich",
				"JH", "Johann Adam Horn", "Juli 1770", 5, 4, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", "Männlich",
				"CB", "Charlotte Buff", "11. September 1772", 5, 5, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", "Weiblich",
				"JR", "Johann Gottfried Roederer", "21. September 1771", 6, 1, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", "Männlich",
				"CG", "Cornelia Goethe", "August 1767", 6, 2, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", "Weiblich",
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 6, 3, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", "Männlich",

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 6, 4, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", "Männlich",
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 6, 5, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", "Männlich",
				"JH", "Johann Adam Horn", "Juli 1770", 7, 1, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", "Männlich",
				"CB", "Charlotte Buff", "11. September 1772", 7, 2, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", "Weiblich",
				"JR", "Johann Gottfried Roederer", "21. September 1771", 7, 3, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", "Männlich",
				"CG", "Cornelia Goethe", "August 1767", 7, 4, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", "Weiblich",
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 7, 5, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", "Männlich",

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 8, 1, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", "Männlich",
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 8, 2, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", "Männlich",
				"JH", "Johann Adam Horn", "Juli 1770", 8, 3, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", "Männlich",
				"CB", "Charlotte Buff", "11. September 1772", 8, 4, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", "Weiblich",
				"JR", "Johann Gottfried Roederer", "21. September 1771", 8, 5, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", "Männlich",
				"CG", "Cornelia Goethe", "August 1767", 9, 1, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", "Weiblich",
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 9, 2, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", "Männlich",

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 9, 3, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", "Männlich",
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 9, 4, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", "Männlich",
				"JH", "Johann Adam Horn", "Juli 1770", 9, 5, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", "Männlich",
				"CB", "Charlotte Buff", "11. September 1772", 10, 1, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", "Weiblich",
				"JR", "Johann Gottfried Roederer", "21. September 1771", 10, 2, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", "Männlich",
				"CG", "Cornelia Goethe", "August 1767", 10, 3, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", "Weiblich",
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 10, 4, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", "Männlich",

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 10, 5, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", "Männlich",
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 11, 1, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", "Männlich",
				"JH", "Johann Adam Horn", "Juli 1770", 11, 2, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", "Männlich",
				"CB", "Charlotte Buff", "11. September 1772", 11, 3, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", "Weiblich",
				"JR", "Johann Gottfried Roederer", "21. September 1771", 11, 4, "GB01 Nr.88", "https://goethe-biographica.de/", "http://d-nb.info/gnd/124456359", "Männlich",
				"CG", "Cornelia Goethe", "August 1767", 11, 5, "GB01 Nr.25", "https://goethe-biographica.de/", "http://d-nb.info/gnd/11871791X", "Weiblich",
				"FM", "Friedrich Maximilian Moors", "01. Oktober 1766", 12, 1, "GB01 Nr.16", "https://goethe-biographica.de/", "http://d-nb.info/gnd/117135364", "Männlich",

				"EB", "Ernst Wolfgang Behrisch", "12. Oktober 1766", 12, 2, "GB01 Nr.20", "https://goethe-biographica.de/id/GB02_BR003_0", "http://d-nb.info/gnd/116111631", "Männlich",
				"LB", "Ludwig Ysenburg von Buri", "23. Mai 1764", 12, 3, "GB01 Nr.1", "https://goethe-biographica.de/", "http://d-nb.info/gnd/100063934", "Männlich",
				"JH", "Johann Adam Horn", "Juli 1770", 12, 4, "GB01 Nr.EB018", "https://goethe-biographica.de/",  "http://d-nb.info/gnd/119027682", "Männlich",
				"CB", "Charlotte Buff", "11. September 1772", 12, 5, "GB01 Nr.103", "https://goethe-biographica.de/", "http://d-nb.info/gnd/118638076", "Keine Info",
			] */
			
			// richtige Goethe-Daten
			// 0: id, 1: placeSent, 2: placeSentId, 3: date, 4: receiver, 5: receiverKey, 6: receiverId, 7: placeReceived, 8: placeReceivedID, 9: year, 10: month, 11: dateFormatted, 12: type, 13: idFormatted, 14: receiverFirstName, 15: receiverLastName, 16: receiverFormatted, 17: receiverInitials, 18: lobidURL, 19: propyURL, 20: receiverGender, 21: placeSentLat, 22: placeSentLong, 23: placeReceivedLat, 24: placeReceivedLong
			const table = [
				"GB01_1_BR020_0","Leipzig","http://www.geonames.org/2879139/","1766-10-12","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Leipzig","http://www.geonames.org/2879139/","1766","10","12","12. Oktober 1766","GB","GB01 Nr.20","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.33962","12.37129",			
				"GB01_1_BR039_0","Leipzig","http://www.geonames.org/2879139/","1767-12-22","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Dessau","http://www.geonames.org/2937959/","1767","12","22","22. Dezember 1767","GB","GB01 Nr.39","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.83864","12.24555",			
				"GB01_1_BR001_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1764-05-23","Buri, Ludwig Ysenburg von","SNDB36192","http://d-nb.info/gnd/100063934","Neuhof","http://www.geonames.org/2864940/","1764","05","23","23. Mai 1764","GB","GB01 Nr.1","Ludwig Ysenburg von","Buri","Ludwig Ysenburg von Buri","LB","https://lobid.org/gnd/100063934","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.17123","8.21065",			
				"GB01_1_BR060_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-08-26","Schönkopf, Anna Catharina","SNDB53514","http://d-nb.info/gnd/118951777","Leipzig","http://www.geonames.org/2879139/","1769","08","26","26. August 1769","GB","GB01 Nr.60","Anna Catharina","Schönkopf","Anna Catharina Schönkopf","AS","https://lobid.org/gnd/118951777","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",			
				"GB01_1_BR118_0","Darmstadt","http://www.geonames.org/2938913/","1772-11-28","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","11","28","28. November 1772","GB","GB01 Nr.118","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","49.87167","8.65027","50.56109","8.50495",			
				"GB01_1_BR002_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1764-06-02","Buri, Ludwig Ysenburg von","SNDB63170","http://d-nb.info/gnd/100063934","Neuhof","http://www.geonames.org/2864940/","1764","06","02","02. Juni 1764","GB","GB01 Nr.2","Ludwig Ysenburg von","Buri","Ludwig Ysenburg von Buri","LB","https://lobid.org/gnd/100063934","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.17123","8.21065",
				"GB01_1_EB027_0","Darmstadt","http://www.geonames.org/2938913/","1772-11-28","Gotter, Friedrich Wilhelm","SNDB53751","http://d-nb.info/gnd/118540939","Gotha","http://www.geonames.org/2918752/","1772","11","28","28. November 1772","GB","GB01 Nr.EB027","Friedrich Wilhelm","Gotter","Friedrich Wilhelm Gotter","FG","https://lobid.org/gnd/118540939","https://goethe-biographica.de/","Männlich","49.87167","8.65027","50.94823","10.70193",
				"GB01_1_EB021_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-01","Salzmann, Johann Daniel","SNDB41006","http://d-nb.info/gnd/116777265","Strassburg","http://www.geonames.org/2973783/","1772","01",null,"Januar 1772","GB","GB01 Nr.EB021","Johann Daniel","Salzmann","Johann Daniel Salzmann","JS","https://lobid.org/gnd/116777265","https://goethe-biographica.de/","Männlich","50.11552","8.68417","48.58392","7.74553",
				"GB01_1_EB019_0","Strassburg","http://www.geonames.org/2973783/","1770-12","Horn, Johann Adam","SNDB38230","http://d-nb.info/gnd/119027682","Frankfurt a. M.","http://www.geonames.org/2925533/","1770","12",null,"Dezember 1770","GB","GB01 Nr.EB019","Johann Adam","Horn","Johann Adam Horn","JH","https://lobid.org/gnd/119027682","https://goethe-biographica.de/","Männlich","48.58392","7.74553","50.11552","8.68417",
				"GB01_1_EB018_0","Strassburg","http://www.geonames.org/2973783/","1770-07","Horn, Johann Adam","SNDB38230","http://d-nb.info/gnd/119027682","Frankfurt a. M.","http://www.geonames.org/2925533/","1770","07",null,"Juli 1770","GB","GB01 Nr.EB018","Johann Adam","Horn","Johann Adam Horn","JH","https://lobid.org/gnd/119027682","https://goethe-biographica.de/","Männlich","48.58392","7.74553","50.11552","8.68417",
				"GB01_1_EB013_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-01-17","Horn, Johann Adam","SNDB38230","http://d-nb.info/gnd/119027682","Leipzig","http://www.geonames.org/2879139/","1769","01","17","17. Januar 1769","GB","GB01 Nr.EB013","Johann Adam","Horn","Johann Adam Horn","JH","https://lobid.org/gnd/119027682","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_EB009_0","Leipzig","http://www.geonames.org/2879139/","1767-08","Goethe, Johann Caspar","SNDB43777","http://d-nb.info/gnd/118695940","Frankfurt a. M.","http://www.geonames.org/2925533/","1767","08",null,"August 1767","GB","GB01 Nr.EB009","Johann Caspar","Goethe","Johann Caspar Goethe","JG","https://lobid.org/gnd/118695940","https://goethe-biographica.de/","Männlich","51.33962","12.37129","50.11552","8.68417",
				"GB01_1_EB008_0","Leipzig","http://www.geonames.org/2879139/","1767-08","Goethe, Johann Caspar","SNDB43777","http://d-nb.info/gnd/118695940","Frankfurt a. M.","http://www.geonames.org/2925533/","1767","08",null,"August 1767","GB","GB01 Nr.EB008","Johann Caspar","Goethe","Johann Caspar Goethe","JG","https://lobid.org/gnd/118695940","https://goethe-biographica.de/","Männlich","51.33962","12.37129","50.11552","8.68417",
				"GB01_1_EB005_0","Leipzig","http://www.geonames.org/2879139/","1765-12","Schlosser, Johann Georg","SNDB45156","http://d-nb.info/gnd/118795163","Frankfurt a. M.","http://www.geonames.org/2925533/","1765","12",null,"Dezember 1765","GB","GB01 Nr.EB005","Johann Georg","Schlosser","Johann Georg Schlosser","JS","https://lobid.org/gnd/118795163","https://goethe-biographica.de/","Männlich","51.33962","12.37129","50.11552","8.68417",
				"GB01_1_EB001_0","Wiesbaden","http://www.geonames.org/2809346/","1765-06-21","Pog","","","Frankfurt a. M.","http://www.geonames.org/2925533/","1765","06","21","21. Juni 1765","GB","GB01 Nr.EB001","","Pog"," Pog","P",null,"https://goethe-biographica.de/","Keine Info","50.08258","8.24932","50.11552","8.68417",			
				"GB01_1_BR124_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-12-25","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","12","25","25. Dezember 1772","GB","GB01 Nr.124","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.56109","8.50495",			
				"GB01_1_BR122_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-12-15","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","12","15","15. Dezember 1772","GB","GB01 Nr.122","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.56109","8.50495",			
				"GB01_1_BR120_0","Darmstadt","http://www.geonames.org/2938913/","1772-12-07","Herder, Johann Gottfried","SNDB20408","http://d-nb.info/gnd/118549553","Bückeburg","http://www.geonames.org/2942159/","1772","12","07","07. Dezember 1772","GB","GB01 Nr.120","Johann Gottfried","Herder","Johann Gottfried Herder","JH","https://lobid.org/gnd/118549553","https://goethe-biographica.de/","Männlich","49.87167","8.65027","52.26065","9.04939",			
				"GB01_1_BR119_0","Darmstadt","http://www.geonames.org/2938913/","1772-12-06","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","12","06","06. Dezember 1772","GB","GB01 Nr.119","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","49.87167","8.65027","50.56109","8.50495",			
				"GB01_1_BR116_0","Darmstadt","http://www.geonames.org/2938913/","1772-11-19","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","11","19","19. November 1772","GB","GB01 Nr.116","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","49.87167","8.65027","50.56109","8.50495",			
				"GB01_1_BR115_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-11-14","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","11","14","14. November 1772","GB","GB01 Nr.115","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.56109","8.50495",			
				"GB01_1_BR114_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-11-13","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","11","13","13. November 1772","GB","GB01 Nr.114","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.56109","8.50495",			
				"GB01_1_BR113_0","Friedberg","http://www.geonames.org/2924802/","1772-11-10","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","11","10","10. November 1772","GB","GB01 Nr.113","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.33739","8.75591","50.56109","8.50495",			
				"GB01_1_BR111_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-10-27","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","10","27","27. Oktober 1772","GB","GB01 Nr.111","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.56109","8.50495",
				"GB01_1_BR110_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-10-21","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","10","21","21. Oktober 1772","GB","GB01 Nr.110","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.56109","8.50495",
				"GB01_1_BR109_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-10-17","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","10","17","17. Oktober 1772","GB","GB01 Nr.109","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.56109","8.50495",
				"GB01_1_BR108_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-10-07","Buff, Charlotte","SNDB44200","http://d-nb.info/gnd/118638076","Wetzlar","http://www.geonames.org/2809889/","1772","10","07","07. Oktober 1772","GB","GB01 Nr.108","Charlotte","Buff","Charlotte Buff","CB","https://lobid.org/gnd/118638076","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","50.56109","8.50495",
				"GB01_1_BR107_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-10-06","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","10","06","06. Oktober 1772","GB","GB01 Nr.107","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.56109","8.50495",
				"GB01_1_BR103_0","Wetzlar","http://www.geonames.org/2809889/","1772-09-11","Buff, Charlotte","SNDB44200","http://d-nb.info/gnd/118638076","Wetzlar","http://www.geonames.org/2809889/","1772","09","11","11. September 1772","GB","GB01 Nr.103","Charlotte","Buff","Charlotte Buff","CB","https://lobid.org/gnd/118638076","https://goethe-biographica.de/","Weiblich","50.56109","8.50495","50.56109","8.50495",
				"GB01_1_BR102_0","Wetzlar","http://www.geonames.org/2809889/","1772-09-10","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","09","10","10. September 1772","GB","GB01 Nr.102","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.56109","8.50495","50.56109","8.50495",
				"GB01_1_BR101_0","Wetzlar","http://www.geonames.org/2809889/","1772-09-10","Buff, Charlotte","SNDB44200","http://d-nb.info/gnd/118638076","Wetzlar","http://www.geonames.org/2809889/","1772","09","10","10. September 1772","GB","GB01 Nr.101","Charlotte","Buff","Charlotte Buff","CB","https://lobid.org/gnd/118638076","https://goethe-biographica.de/","Weiblich","50.56109","8.50495","50.56109","8.50495",
				"GB01_1_BR100_0","Wetzlar","http://www.geonames.org/2809889/","1772-09-06","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","09","06","06. September 1772","GB","GB01 Nr.100","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.56109","8.50495","50.56109","8.50495",
				"GB01_1_BR099_0","Wetzlar","http://www.geonames.org/2809889/","1772-08-08","Kestner, Johann Christian","SNDB38559","http://d-nb.info/gnd/116150874","Wetzlar","http://www.geonames.org/2809889/","1772","08","08","08. August 1772","GB","GB01 Nr.99","Johann Christian","Kestner","Johann Christian Kestner","JK","https://lobid.org/gnd/116150874","https://goethe-biographica.de/","Männlich","50.56109","8.50495","50.56109","8.50495",
				"GB01_1_BR097_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-02-03","Salzmann, Johann Daniel","SNDB41006","http://d-nb.info/gnd/116777265","Strassburg","http://www.geonames.org/2973783/","1772","02","03","03. Februar 1772","GB","GB01 Nr.97","Johann Daniel","Salzmann","Johann Daniel Salzmann","JS","https://lobid.org/gnd/116777265","https://goethe-biographica.de/","Männlich","50.11552","8.68417","48.58392","7.74553",
				"GB01_1_BR096_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-02-03","Jung, Johann Heinrich","SNDB38444","http://d-nb.info/gnd/118558862","Strassburg","http://www.geonames.org/2973783/","1772","02","03","03. Februar 1772","GB","GB01 Nr.96","Johann Heinrich","Jung","Johann Heinrich Jung","JJ","https://lobid.org/gnd/118558862","https://goethe-biographica.de/","Männlich","50.11552","8.68417","48.58392","7.74553",
				"GB01_1_BR095_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1772-01","Herder, Johann Gottfried","SNDB20408","http://d-nb.info/gnd/118549553","Bückeburg","http://www.geonames.org/2942159/","1772","01",null,"Januar 1772","GB","GB01 Nr.95","Johann Gottfried","Herder","Johann Gottfried Herder","JH","https://lobid.org/gnd/118549553","https://goethe-biographica.de/","Männlich","50.11552","8.68417","52.26065","9.04939",
				"GB01_1_BR093_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1771-11-28","Salzmann, Johann Daniel","SNDB41006","http://d-nb.info/gnd/116777265","Strassburg","http://www.geonames.org/2973783/","1771","11","28","28. November 1771","GB","GB01 Nr.93","Johann Daniel","Salzmann","Johann Daniel Salzmann","JS","https://lobid.org/gnd/116777265","https://goethe-biographica.de/","Männlich","50.11552","8.68417","48.58392","7.74553",
				"GB01_1_BR092_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1771-10","Herder, Johann Gottfried","SNDB20408","http://d-nb.info/gnd/118549553","Bückeburg","http://www.geonames.org/2942159/","1771","10",null,"Oktober 1771","GB","GB01 Nr.92","Johann Gottfried","Herder","Johann Gottfried Herder","JH","https://lobid.org/gnd/118549553","https://goethe-biographica.de/","Männlich","50.11552","8.68417","52.26065","9.04939",
				"GB01_1_BR088_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1771-09-21","Roederer, Johann Gottfried","SNDB53479","http://d-nb.info/gnd/124456359","Strassburg","http://www.geonames.org/2973783/","1771","09","21","21. September 1771","GB","GB01 Nr.88","Johann Gottfried","Roederer","Johann Gottfried Roederer","JR","https://lobid.org/gnd/124456359","https://goethe-biographica.de/","Unbekannt","50.11552","8.68417","48.58392","7.74553",
				"GB01_1_BR087_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1771-08-28","","","","Frankfurt a. M.","http://www.geonames.org/2925533/","1771","08","28","28. August 1771","GB","GB01 Nr.87","",""," ","",null,"https://goethe-biographica.de/","Keine Info","50.11552","8.68417","50.11552","8.68417",
				"GB01_1_BR086_0","Strassburg","http://www.geonames.org/2973783/","1771-08-08","Langer, Ernst Theodor","SNDB53311","http://d-nb.info/gnd/116719761","Lausanne","http://www.geonames.org/2659994/","1771","08","08","08. August 1771","GB","GB01 Nr.86","Ernst Theodor","Langer","Ernst Theodor Langer","EL","https://lobid.org/gnd/116719761","https://goethe-biographica.de/","Männlich","48.58392","7.74553","46.516","6.63282",
				"GB01_1_BR085_0","Sessenheim","http://www.geonames.org/2974735/","1771-06-19","Salzmann, Johann Daniel","SNDB41006","http://d-nb.info/gnd/116777265","Strassburg","http://www.geonames.org/2973783/","1771","06","19","19. Juni 1771","GB","GB01 Nr.85","Johann Daniel","Salzmann","Johann Daniel Salzmann","JS","https://lobid.org/gnd/116777265","https://goethe-biographica.de/","Männlich","48.79652","7.98719","48.58392","7.74553",
				"GB01_1_BR084_0","Sessenheim","http://www.geonames.org/2974735/","1771-06-12","Salzmann, Johann Daniel","SNDB41006","http://d-nb.info/gnd/116777265","Strassburg","http://www.geonames.org/2973783/","1771","06","12","12. Juni 1771","GB","GB01 Nr.84","Johann Daniel","Salzmann","Johann Daniel Salzmann","JS","https://lobid.org/gnd/116777265","https://goethe-biographica.de/","Männlich","48.79652","7.98719","48.58392","7.74553",
				"GB01_1_BR083_0","Sessenheim","http://www.geonames.org/2974735/","1771-06-05","Salzmann, Johann Daniel","SNDB41006","http://d-nb.info/gnd/116777265","Strassburg","http://www.geonames.org/2973783/","1771","06","05","05. Juni 1771","GB","GB01 Nr.83","Johann Daniel","Salzmann","Johann Daniel Salzmann","JS","https://lobid.org/gnd/116777265","https://goethe-biographica.de/","Männlich","48.79652","7.98719","48.58392","7.74553",
				"GB01_1_BR082_0","Sessenheim","http://www.geonames.org/2974735/","1771-05-29","Salzmann, Johann Daniel","SNDB41006","http://d-nb.info/gnd/116777265","Strassburg","http://www.geonames.org/2973783/","1771","05","29","29. Mai 1771","GB","GB01 Nr.82","Johann Daniel","Salzmann","Johann Daniel Salzmann","JS","https://lobid.org/gnd/116777265","https://goethe-biographica.de/","Männlich","48.79652","7.98719","48.58392","7.74553",
				"GB01_1_BR003_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1764-07-06","Buri, Ludwig Ysenburg von","SNDB63170","http://d-nb.info/gnd/100063934","Neuhof","http://www.geonames.org/2864940/","1764","07","06","06. Juli 1764","GB","GB01 Nr.3","Ludwig Ysenburg von","Buri","Ludwig Ysenburg von Buri","LB","https://lobid.org/gnd/100063934","https://goethe-biographica.de/","Männlich","50.11552","8.68417","50.17123","8.21065",
				"GB01_1_BR078_0","Strassburg","http://www.geonames.org/2973783/","1770-10-15","Brion, Friederike","SNDB43267","http://d-nb.info/gnd/118515500","Sessenheim","http://www.geonames.org/2974735/","1770","10","15","15. Oktober 1770","GB","GB01 Nr.78","Friederike","Brion","Friederike Brion","FB","https://lobid.org/gnd/118515500","https://goethe-biographica.de/","Weiblich","48.58392","7.74553","48.79652","7.98719",
				"GB01_1_BR077_0","Strassburg","http://www.geonames.org/2973783/","1770-10-14","Fabricius, Anna Catharina","SNDB53180","http://d-nb.info/gnd/1014254809","Worms","http://www.geonames.org/2806142/","1770","10","14","14. Oktober 1770","GB","GB01 Nr.77","Anna Catharina","Fabricius","Anna Catharina Fabricius","AF","https://lobid.org/gnd/1014254809","https://goethe-biographica.de/","Weiblich","48.58392","7.74553","49.63278","8.35916",
				"GB01_1_BR076_0","Strassburg","http://www.geonames.org/2973783/","1770-09-30","Engelbach, Johann Conrad","SNDB53161","","Saarbrücken","http://www.geonames.org/2842647/","1770","09","30","30. September 1770","GB","GB01 Nr.76","Johann Conrad","Engelbach","Johann Conrad Engelbach","JE",null,"https://goethe-biographica.de/","Keine Info","48.58392","7.74553","49.23262","7.00982",
				"GB01_1_BR075_0","Strassburg","http://www.geonames.org/2973783/","1770-09-28","Hetzler, Johann Georg","SNDB38092","http://d-nb.info/gnd/1104178125","Frankfurt a. M.","http://www.geonames.org/2925533/","1770","09","28","28. September 1770","GB","GB01 Nr.75","Johann Georg","Hetzler","Johann Georg Hetzler","JH","https://lobid.org/gnd/1104178125","https://goethe-biographica.de/","Männlich","48.58392","7.74553","50.11552","8.68417",
				"GB01_1_BR074_0","Strassburg","http://www.geonames.org/2973783/","1770-08-26","Klettenberg, Susanna Catharina von","SNDB38645","http://d-nb.info/gnd/11872357X","Frankfurt a. M.","http://www.geonames.org/2925533/","1770","08","26","26. August 1770","GB","GB01 Nr.74","Susanna Catharina von","Klettenberg","Susanna Catharina von Klettenberg","SK","https://lobid.org/gnd/11872357X","https://goethe-biographica.de/","Weiblich","48.58392","7.74553","50.11552","8.68417",
				"GB01_1_BR073_0","Strassburg","http://www.geonames.org/2973783/","1770-08-24","Hetzler, Johann Ludwig","SNDB38091","http://www.lagis-hessen.de/de/subjects/idrec/sn/bio/id/10458","Frankfurt a. M.","http://www.geonames.org/2925533/","1770","08","24","24. August 1770","GB","GB01 Nr.73","Johann Ludwig","Hetzler","Johann Ludwig Hetzler","JH","https://lobid.org/gnd/subjects","https://goethe-biographica.de/","Keine Info","48.58392","7.74553","50.11552","8.68417",
				"GB01_1_BR072_0","Strassburg","http://www.geonames.org/2973783/","1770-07-28","Trapp, Augustin","SNDB42112","","Worms","http://www.geonames.org/2806142/","1770","07","28","28. Juli 1770","GB","GB01 Nr.72","Augustin","Trapp","Augustin Trapp","AT",null,"https://goethe-biographica.de/","Keine Info","48.58392","7.74553","49.63278","8.35916",
				"GB01_1_BR071_0","Strassburg","http://www.geonames.org/2973783/","1770-07-14","Hetzler, Johann Ludwig","SNDB38091","","Frankfurt a. M.","http://www.geonames.org/2925533/","1770","07","14","14. Juli 1770","GB","GB01 Nr.71","Johann Ludwig","Hetzler","Johann Ludwig Hetzler","JH",null,"https://goethe-biographica.de/","Keine Info","48.58392","7.74553","50.11552","8.68417",
				"GB01_1_BR070_0","Saarbrücken","http://www.geonames.org/2842647/","1770-06-27","Fabricius, Anna Catharina","SNDB53180","http://d-nb.info/gnd/1014254809","Worms","http://www.geonames.org/2806142/","1770","06","27","27. Juni 1770","GB","GB01 Nr.70","Anna Catharina","Fabricius","Anna Catharina Fabricius","AF","https://lobid.org/gnd/1014254809","https://goethe-biographica.de/","Weiblich","49.23262","7.00982","49.63278","8.35916",
				"GB01_1_BR067_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1770-02-20","Reich, Philipp Erasmus","SNDB53451","http://d-nb.info/gnd/118809334","Leipzig","http://www.geonames.org/2879139/","1770","02","20","20. Februar 1770","GB","GB01 Nr.67","Philipp Erasmus","Reich","Philipp Erasmus Reich","PR","https://lobid.org/gnd/118809334","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR066_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1770-02-06","Hermann, Christian Gottfried","SNDB53840","http://d-nb.info/gnd/140977953","Leipzig","http://www.geonames.org/2879139/","1770","02","06","06. Februar 1770","GB","GB01 Nr.66","Christian Gottfried","Hermann","Christian Gottfried Hermann","CH","https://lobid.org/gnd/140977953","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR065_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1770-01-23","Schönkopf, Anna Catharina","SNDB53514","http://d-nb.info/gnd/118951777","Leipzig","http://www.geonames.org/2879139/","1770","01","23","23. Januar 1770","GB","GB01 Nr.65","Anna Catharina","Schönkopf","Anna Catharina Schönkopf","AS","https://lobid.org/gnd/118951777","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR064_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-12-12","Schönkopf, Anna Catharina","SNDB53514","http://d-nb.info/gnd/118951777","Leipzig","http://www.geonames.org/2879139/","1769","12","12","12. Dezember 1769","GB","GB01 Nr.64","Anna Catharina","Schönkopf","Anna Catharina Schönkopf","AS","https://lobid.org/gnd/118951777","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR063_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-11-30","Langer, Ernst Theodor","SNDB53311","http://d-nb.info/gnd/116719761","Lausanne","http://www.geonames.org/2659994/","1769","11","30","30. November 1769","GB","GB01 Nr.63","Ernst Theodor","Langer","Ernst Theodor Langer","EL","https://lobid.org/gnd/116719761","https://goethe-biographica.de/","Männlich","50.11552","8.68417","46.516","6.63282",
				"GB01_1_BR061_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-08","Breitkopf, Christoph Gottlob","SNDB36046","http://d-nb.info/gnd/120691124","Leipzig","http://www.geonames.org/2879139/","1769","08",null,"August 1769","GB","GB01 Nr.61","Christoph Gottlob","Breitkopf","Christoph Gottlob Breitkopf","CB","https://lobid.org/gnd/120691124","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR059_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-06-01","Schönkopf, Anna Catharina","SNDB53514","http://d-nb.info/gnd/118951777","Leipzig","http://www.geonames.org/2879139/","1769","06","01","01. Juni 1769","GB","GB01 Nr.59","Anna Catharina","Schönkopf","Anna Catharina Schönkopf","AS","https://lobid.org/gnd/118951777","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR058_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-04-08","Oeser, Friederike","SNDB44718","http://d-nb.info/gnd/117106666","Leipzig","http://www.geonames.org/2879139/","1769","04","08","08. April 1769","GB","GB01 Nr.58","Friederike","Oeser","Friederike Oeser","FO","https://lobid.org/gnd/117106666","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR057_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-02-14","Oeser, Adam Friedrich","SNDB53395","http://d-nb.info/gnd/118786792","Leipzig","http://www.geonames.org/2879139/","1769","02","14","14. Februar 1769","GB","GB01 Nr.57","Adam Friedrich","Oeser","Adam Friedrich Oeser","AO","https://lobid.org/gnd/118786792","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR056_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-02-13","Oeser, Friederike","SNDB44718","http://d-nb.info/gnd/117106666","Leipzig","http://www.geonames.org/2879139/","1769","02","13","13. Februar 1769","GB","GB01 Nr.56","Friederike","Oeser","Friederike Oeser","FO","https://lobid.org/gnd/117106666","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR055_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-01-31","Schönkopf, Anna Catharina","SNDB53514","http://d-nb.info/gnd/118951777","Leipzig","http://www.geonames.org/2879139/","1769","01","31","31. Januar 1769","GB","GB01 Nr.55","Anna Catharina","Schönkopf","Anna Catharina Schönkopf","AS","https://lobid.org/gnd/118951777","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR054_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1769-01-17","Langer, Ernst Theodor","SNDB53311","http://d-nb.info/gnd/116719761","Leipzig","http://www.geonames.org/2879139/","1769","01","17","17. Januar 1769","GB","GB01 Nr.54","Ernst Theodor","Langer","Ernst Theodor Langer","EL","https://lobid.org/gnd/116719761","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR053_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1768-12-30","Schönkopf, Anna Catharina","SNDB53514","http://d-nb.info/gnd/118951777","Leipzig","http://www.geonames.org/2879139/","1768","12","30","30. Dezember 1768","GB","GB01 Nr.53","Anna Catharina","Schönkopf","Anna Catharina Schönkopf","AS","https://lobid.org/gnd/118951777","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR052_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1768-11-24","Oeser, Adam Friedrich","SNDB53395","http://d-nb.info/gnd/118786792","Leipzig","http://www.geonames.org/2879139/","1768","11","24","24. November 1768","GB","GB01 Nr.52","Adam Friedrich","Oeser","Adam Friedrich Oeser","AO","https://lobid.org/gnd/118786792","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR051_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1768-11-24","Langer, Ernst Theodor","SNDB53311","http://d-nb.info/gnd/116719761","Leipzig","http://www.geonames.org/2879139/","1768","11","24","24. November 1768","GB","GB01 Nr.51","Ernst Theodor","Langer","Ernst Theodor Langer","EL","https://lobid.org/gnd/116719761","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR050_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1768-11-09","Langer, Ernst Theodor","SNDB53311","http://d-nb.info/gnd/116719761","Leipzig","http://www.geonames.org/2879139/","1768","11","09","09. November 1768","GB","GB01 Nr.50","Ernst Theodor","Langer","Ernst Theodor Langer","EL","https://lobid.org/gnd/116719761","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR049_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1768-11-09","Oeser, Adam Friedrich","SNDB53395","http://d-nb.info/gnd/118786792","Leipzig","http://www.geonames.org/2879139/","1768","11","09","09. November 1768","GB","GB01 Nr.49","Adam Friedrich","Oeser","Adam Friedrich Oeser","AO","https://lobid.org/gnd/118786792","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR048_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1768-11-06","Oeser, Friederike","SNDB44718","http://d-nb.info/gnd/117106666","Leipzig","http://www.geonames.org/2879139/","1768","11","06","06. November 1768","GB","GB01 Nr.48","Friederike","Oeser","Friederike Oeser","FO","https://lobid.org/gnd/117106666","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR047_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1768-11-01","Schönkopf, Anna Catharina","SNDB53514","http://d-nb.info/gnd/118951777","Leipzig","http://www.geonames.org/2879139/","1768","11","01","01. November 1768","GB","GB01 Nr.47","Anna Catharina","Schönkopf","Anna Catharina Schönkopf","AS","https://lobid.org/gnd/118951777","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR045_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1768-09","Schönkopf, Anna Catharina","SNDB53514","http://d-nb.info/gnd/118951777","Leipzig","http://www.geonames.org/2879139/","1768","09",null,"September 1768","GB","GB01 Nr.45","Anna Catharina","Schönkopf","Anna Catharina Schönkopf","AS","https://lobid.org/gnd/118951777","https://goethe-biographica.de/","Weiblich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR044_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1768-09-13","Oeser, Adam Friedrich","SNDB53395","http://d-nb.info/gnd/118786792","Leipzig","http://www.geonames.org/2879139/","1768","09","13","13. September 1768","GB","GB01 Nr.44","Adam Friedrich","Oeser","Adam Friedrich Oeser","AO","https://lobid.org/gnd/118786792","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR043_0","Frankfurt a. M.","http://www.geonames.org/2925533/","1768-09-08","Langer, Ernst Theodor","SNDB53311","http://d-nb.info/gnd/116719761","Leipzig","http://www.geonames.org/2879139/","1768","09","08","08. September 1768","GB","GB01 Nr.43","Ernst Theodor","Langer","Ernst Theodor Langer","EL","https://lobid.org/gnd/116719761","https://goethe-biographica.de/","Männlich","50.11552","8.68417","51.33962","12.37129",
				"GB01_1_BR041_0","Leipzig","http://www.geonames.org/2879139/","1768-04-26","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Dessau","http://www.geonames.org/2937959/","1768","04","26","26. April 1768","GB","GB01 Nr.41","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.83864","12.24555",
				"GB01_1_BR040_0","Leipzig","http://www.geonames.org/2879139/","1768-03","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Dessau","http://www.geonames.org/2937959/","1768","03",null,"März 1768","GB","GB01 Nr.40","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.83864","12.24555",
				"GB01_1_BR004_0","Wiesbaden","http://www.geonames.org/2809346/","1765-06-21","Goethe, Cornelia","SNDB45161","http://d-nb.info/gnd/11871791X","Frankfurt a. M.","http://www.geonames.org/2925533/","1765","06","21","21. Juni 1765","GB","GB01 Nr.4","Cornelia","Goethe","Cornelia Goethe","CG","https://lobid.org/gnd/11871791X","https://goethe-biographica.de/","Weiblich","50.08258","8.24932","50.11552","8.68417",
				"GB01_1_BR038_0","Leipzig","http://www.geonames.org/2879139/","1767-12-15","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Dessau","http://www.geonames.org/2937959/","1767","12","15","15. Dezember 1767","GB","GB01 Nr.38","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.83864","12.24555",
				"GB01_1_BR037_0","Leipzig","http://www.geonames.org/2879139/","1767-12-04","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Dessau","http://www.geonames.org/2937959/","1767","12","04","04. Dezember 1767","GB","GB01 Nr.37","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.83864","12.24555",
				"GB01_1_BR036_0","Leipzig","http://www.geonames.org/2879139/","1767-11-27","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Dessau","http://www.geonames.org/2937959/","1767","11","27","27. November 1767","GB","GB01 Nr.36","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.83864","12.24555",
				"GB01_1_BR033_0","Leipzig","http://www.geonames.org/2879139/","1767-11-07","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Dessau","http://www.geonames.org/2937959/","1767","11","07","07. November 1767","GB","GB01 Nr.33","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.83864","12.24555",
				"GB01_1_BR031_0","Leipzig","http://www.geonames.org/2879139/","1767-10-24","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Dessau","http://www.geonames.org/2937959/","1767","10","24","24. Oktober 1767","GB","GB01 Nr.31","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.83864","12.24555",
				"GB01_1_BR028_0","Leipzig","http://www.geonames.org/2879139/","1767-10-13","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Leipzig","http://www.geonames.org/2879139/","1767","10","13","13. Oktober 1767","GB","GB01 Nr.28","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.33962","12.37129",
				"GB01_1_BR025_0","Leipzig","http://www.geonames.org/2879139/","1767-08","Goethe, Cornelia","SNDB49571","http://d-nb.info/gnd/11871791X","Frankfurt a. M.","http://www.geonames.org/2925533/","1767","08",null,"August 1767","GB","GB01 Nr.25","Cornelia","Goethe","Cornelia Goethe","CG","https://lobid.org/gnd/11871791X","https://goethe-biographica.de/","Weiblich","51.33962","12.37129","50.11552","8.68417",
				"GB01_1_BR024_0","Leipzig","http://www.geonames.org/2879139/","1767-08","Goethe, Cornelia","SNDB49571","http://d-nb.info/gnd/11871791X","Frankfurt a. M.","http://www.geonames.org/2925533/","1767","08",null,"August 1767","GB","GB01 Nr.24","Cornelia","Goethe","Cornelia Goethe","CG","https://lobid.org/gnd/11871791X","https://goethe-biographica.de/","Weiblich","51.33962","12.37129","50.11552","8.68417",
				"GB01_1_BR021_0","Leipzig","http://www.geonames.org/2879139/","1766-10-12","Behrisch, Ernst Wolfgang","SNDB43091","http://d-nb.info/gnd/116111631","Leipzig","http://www.geonames.org/2879139/","1766","10","12","12. Oktober 1766","GB","GB01 Nr.21","Ernst Wolfgang","Behrisch","Ernst Wolfgang Behrisch","EB","https://lobid.org/gnd/116111631","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.33962","12.37129",
				"GB01_1_BR017_0","Leipzig","http://www.geonames.org/2879139/","1766-10-01","Trapp, Augustin","SNDB42112","","Frankfurt a. M.","http://www.geonames.org/2925533/","1766","10","01","01. Oktober 1766","GB","GB01 Nr.17","Augustin","Trapp","Augustin Trapp","AT",null,"https://goethe-biographica.de/","Keine Info","51.33962","12.37129","50.11552","8.68417",
				"GB01_1_BR016_0","Leipzig","http://www.geonames.org/2879139/","1766-10-01","Moors, Friedrich Maximilian","SNDB53368","http://d-nb.info/gnd/117135364","Göttingen","http://www.geonames.org/2918632/","1766","10","01","01. Oktober 1766","GB","GB01 Nr.16","Friedrich Maximilian","Moors","Friedrich Maximilian Moors","FM","https://lobid.org/gnd/117135364","https://goethe-biographica.de/","Männlich","51.33962","12.37129","51.53443","9.93228",
				"GB01_1_BR015_0","Leipzig","http://www.geonames.org/2879139/","1766-06-02","Trapp, Augustin","SNDB42112","","Worms","http://www.geonames.org/2806142/","1766","06","02","02. Juni 1766","GB","GB01 Nr.15","Augustin","Trapp","Augustin Trapp","AT",null,"https://goethe-biographica.de/","Keine Info","51.33962","12.37129","49.63278","8.35916",
				"GB01_1_BR013_0","Leipzig","http://www.geonames.org/2879139/","1766-04-28","Riese, Johann Jacob","SNDB40718","http://d-nb.info/gnd/1110069057","Marburg","http://www.geonames.org/2873759/","1766","04","28","28. April 1766","GB","GB01 Nr.13","Johann Jacob","Riese","Johann Jacob Riese","JR","https://lobid.org/gnd/1110069057","https://goethe-biographica.de/","Männlich","51.33962","12.37129","50.80904","8.77069",
				"GB01_1_BR012_0","Leipzig","http://www.geonames.org/2879139/","1766-03-14","Goethe, Cornelia","SNDB49571","http://d-nb.info/gnd/11871791X","Frankfurt a. M.","http://www.geonames.org/2925533/","1766","03","14","14. März 1766","GB","GB01 Nr.12","Cornelia","Goethe","Cornelia Goethe","CG","https://lobid.org/gnd/11871791X","https://goethe-biographica.de/","Weiblich","51.33962","12.37129","50.11552","8.68417",
				"GB01_1_BR006_0","Leipzig","http://www.geonames.org/2879139/","1765-10-18","Goethe, Cornelia","SNDB45161","http://d-nb.info/gnd/11871791X","Frankfurt a. M.","http://www.geonames.org/2925533/","1765","10","18","18. Oktober 1765","GB","GB01 Nr.6","Cornelia","Goethe","Cornelia Goethe","CG","https://lobid.org/gnd/11871791X","https://goethe-biographica.de/","Weiblich","51.33962","12.37129","50.11552","8.68417"]

			let camera, scene, renderer;
			let controls;

			// leerer objects array
			const objects = [];
			// targets objekt mit leeren Arrays für die vier Darstellungsweisen
			const targets = { table: [], sphere: [], helix: [], grid: [] };

			// Funktionsaufrufe
			init();
			animate();

			function init() {

				// Instanziierung der Kamera
				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.z = 3000;

				// Instanziierung der Szene
				scene = new THREE.Scene();

				// TABLE
                /* 
                bei mehr Elementen überlagern sie sich
                ToDo: Table so anpassen, dass als Rechteck angezeigt, das erweitert werden kann
                Alternativ: Grid verwenden?
                */

				// Iteration über Datensätze
				// i+= x zeigt an, wo neuer Datensatz beginnt (x -> Indexposition des letzten Elements plus 2)
				for ( let i = 0; i < table.length; i += 26 ) {

					// <div class="element">
					const element = document.createElement( 'div' );
					element.className = 'element';
					// Math.random legt einen zufälligen Alpha-Wert für die Hintergrundfarbe fest
					// element.style.backgroundColor = 'rgba(255,0,0,' + ( Math.random() * 0.5 + 0.25 ) + ')';
					// ohne Math.random
					
					if(table[i + 21] == "Weiblich"){
						element.style.backgroundColor = 'rgb(237, 125, 49, 0.5)';
					} else if (table[i + 21] == "Männlich") {
						element.style.backgroundColor = 'rgb(231, 230, 230, 0.5)';
					} else {
						element.style.backgroundColor = 'rgb(0, 0, 0, 0.5)';
					}
					;
					//element.style.backgroundColor = 'rgb(231, 230, 230, 0.5)';
					element.setAttribute("onclick", "window.open(' " + table[i + 20] +"')");

					// <div class="id">
					const id = document.createElement( 'div' );
					id.className = 'id';
					id.textContent = table[i + 14];
					element.appendChild( id );

					// <div class="initials">
					const initials = document.createElement( 'div' );
					initials.className = 'initials';
					initials.textContent = table[ i + 18];
					initials.setAttribute("onclick", "window.open(' " + table[i + 6] +"')");
					element.appendChild( initials );

					// <div class="name">
					const name = document.createElement( 'div' );
					name.className = 'name';
					name.innerHTML = table[ i + 17 ] ;
					name.setAttribute("onclick", "window.open(' " + table[i + 6] +"')");
					element.appendChild( name );

					// <div class="date">
					const date = document.createElement( 'div' );
					date.className = 'date';
					date.innerHTML = table[ i + 12 ] ;
					element.appendChild( date );

					// erstellt ein CSS3DObjekt aus Variable element
					// die Anfangsposition der Elemente wird zufällig festgelegt
					const objectCSS = new CSS3DObject( element );
					objectCSS.position.x = Math.random() * 4000 - 2000;
					objectCSS.position.y = Math.random() * 4000 - 2000;
					objectCSS.position.z = Math.random() * 4000 - 2000;
					scene.add( objectCSS );

					// alle objectCSS elemente werden in den objects Array aufgenommen
					objects.push( objectCSS );

					//

					// fixe Positionierung in der Table-Ansicht
					const object = new THREE.Object3D();
					// Wie kommt man auf diese Zahlen?
					object.position.x = ( table[ i + 3 ] * 140 ) - 1330;
					object.position.y = - ( table[ i + 4 ] * 180 ) + 990;

					// Objekte werden in das table Array des targets-Objekts aufgenommen
					targets.table.push( object );

				}

				// SPHERE
                /* 
                Kann viele Elemente beinhalten, erst ab ca. 400 wird es kritisch, weil sich die Elemente überlagern.
                14 Elemente als Minimum für Sphärenansicht

                ToDo: Aufspaltung in mehrere Kugeln je nach Zeitfilter
                */


				// Instanziierung eines leeren 3D-Vektors
				const vector = new THREE.Vector3();

				// Anpassung der Sphären an den Zeitfilter
				// 1. Zeitschritte festlegen, Maximum an Schritten festlegen
				let step = 1;
				let maxStep = 9;
				/*  2. Für jeden Zeitschritt einen eigenen Array erstellen (zweidimensionaler Array), 
				 array = [[{Daten Brief1 1764}, {Daten Brief2 1764}, ...],
						  [{Daten Brief1 1765}, {Daten Brief2 1765}, ...],
						  [{Daten Brief1 1766}, {Daten Brief2 1766}, ...], 
						  ...]
				 mit Funktion filter(), Zeitschritte von 1 bis 9 erlaubt (9 Jahre = max an Zeitschritten)
				 leere Arrays für Zeitschritte ohne Briefe */

									/* let counter = 9; 
									for (let i = 1764; i <= 1772; i + step ){
										if(table[counter] == i){
											// geht nicht mit der flachen Struktur, Objektstruktur besser	
											const array = table.filter((year) => (year) >= i);
										}
										counter += 26;
									} */
									
				// 3. Für jeden der Arrays eine eigene Sphäre aufbauen, 
				/* Positionierung der Sphären muss sich um den Radius der Kugel (800) nach oben verschieben
				
				for-loop1: über äußeren Array -> erstellt Sphären, für jeden Array wird der Code zur Sphärengenerierung einmal ausgeführt,
				nach jeder Iteration Positionierung plus 800 nach oben

				for-loop2: über inneren Array / Briefobjekte
				für jeden Brief wird ein objectCSS erstellt und ein Rechteck generiert
				
				*/

				// Loop über Objects Array
				for ( let i = 0, l = objects.length; i < l; i ++ ) {

					// Berechnung von Winkeln, die für die Positionierung in sphärischem Koordinatensystem notwendig sind
					// Basiert auf Index und Länge des Objekt-Arrays
					// phi = polar angle in radians from the y (up) axis
					// theta = equator angle in radians around the y (up) axis
					const phi = Math.acos( - 1 + ( 2 * i ) / l );
					const theta = Math.sqrt( l * Math.PI ) * phi;

					const object = new THREE.Object3D();

					// Objekt (Element) wird in einem sphärischem Koordinatensystem d.h. auf der Kugel platziert
					// https://en.wikipedia.org/wiki/Spherical_coordinate_system
					// Mehr Infos zu sphärischen Koordinaten in three.js: https://threejs.org/docs/index.html?q=vector#api/en/math/Spherical
					// Parameter: radial distance from point to origin (Mittelpunkt), phi, theta
					object.position.setFromSphericalCoords( 800, phi, theta );
					
					// im Vektor wird die Position des Objekts gespeichert und skalar mit 2 multipliziert
					// warum?
					vector.copy( object.position ).multiplyScalar( 2 );

					// Objekt und Vektor schauen sich an
					// Objekt wird so rotiert, dass siene interne Z-Achse zum Vektor zeigt
					// was auch immer das heißen soll???
					object.lookAt( vector );

					// Objekt wird zum Sphären Array im Targets-Objekt hinzugefügt
					targets.sphere.push( object );

				}

				// HELIX
                /* funktioniert für beliebige Anzahl an aufeinanderfolgenden Elementen
                ToDo: Anpassung von Anzahl der Umdrehungen gemäß Zeitfilter
                ToDo: Was passiert, wenn es Lücken im Zeitverlauf gibt? Leere /schwarze Elemente als PLatzhalter?
                 */
				
                for ( let i = 0, l = objects.length; i < l; i ++ ) {

					const theta = i * 0.175 + Math.PI; // Wie groß sind die Abstände zwischen den Elementen? (links-rechts)
					const y = - ( i * 15 ) + 450; // Wie groß sind die Abstände zwischen den Elementen? (oben-unten)

					const object = new THREE.Object3D();

					// Objekt wird in einem zylindrischen Koordinatensystem positioniert (Helix hat die Form eines Zylinders)
					// Mehr Infos zu zylindrischen Koordinaten in three.js: https://threejs.org/docs/index.html?q=vector#api/en/math/Cylindrical
					// Parameter: 
					// radius (distance from the origin to a point in the x-z plane)
					// theta = counterclockwise angle in the x-z plane measured in radians from the positive z-axis
					// y = height above the x-z plane
					object.position.setFromCylindricalCoords( 900, theta, y );

					vector.x = object.position.x * 2;
					vector.y = object.position.y;
					vector.z = object.position.z * 2;

					object.lookAt( vector );

					targets.helix.push( object );

				}

				// GRID
                // macht einen 5 x 5 Grid

				/* for ( let i = 0; i < objects.length; i ++ ) {

					const object = new THREE.Object3D();
					// ???
					object.position.x = ( ( i % 5 ) * 400 ) - 800;
					object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
					object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;

					targets.grid.push( object );

				} */

				// Renderer

				renderer = new CSS3DRenderer();
				renderer.setSize( window.innerWidth, window.innerHeight );
				// im div mit id = container werdend die Objekte gerendert
				document.getElementById( 'container' ).appendChild( renderer.domElement );

				// Funktionalitäten der Buttons (Ansichtswechsel)

				controls = new TrackballControls( camera, renderer.domElement );
				controls.minDistance = 500;
				controls.maxDistance = 6000;
				controls.addEventListener( 'change', render );

				const buttonTable = document.getElementById( 'table' );
				buttonTable.addEventListener( 'click', function () {

					transform( targets.table, 2000 );

				} );

				const buttonSphere = document.getElementById( 'sphere' );
				buttonSphere.addEventListener( 'click', function () {

					transform( targets.sphere, 2000 );

				} );

				const buttonHelix = document.getElementById( 'helix' );
				buttonHelix.addEventListener( 'click', function () {

					transform( targets.helix, 2000 );

				} );

				/* const buttonGrid = document.getElementById( 'grid' );
				buttonGrid.addEventListener( 'click', function () {

					transform( targets.grid, 2000 );

				} ); */

				transform( targets.table, 2000 );

				//

				window.addEventListener( 'resize', onWindowResize );

			}

			// Funktion, welche die Elemente auf die neue Position verschiebt
			function transform( targets, duration ) {

				TWEEN.removeAll();

				for ( let i = 0; i < objects.length; i ++ ) {

					const object = objects[ i ];
					const target = targets[ i ];

					new TWEEN.Tween( object.position )
						.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
						.easing( TWEEN.Easing.Exponential.InOut )
						.start();

					new TWEEN.Tween( object.rotation )
						.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
						.easing( TWEEN.Easing.Exponential.InOut )
						.start();

				}

				new TWEEN.Tween( this )
					.to( {}, duration * 2 )
					.onUpdate( render )
					.start();

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				render();

			}

			function animate() {

				requestAnimationFrame( animate );

				TWEEN.update();

				controls.update();

			}

			function render() {

				renderer.render( scene, camera );

			}
