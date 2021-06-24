// bsearch-based array element check
function contains(array, elem) {
	var min = 0, max = array.length, i, cur;

	while (min < max) {
		i = min + Math.floor((max-min)/2);
		cur = array[i];

		if (cur === elem)
			return true;
		else if (cur < elem)
			min = i + 1;
		else
			max = i;
	}

	return false;
}

var MinedMapLayer = L.GridLayer.extend({
	initialize: function (mipmaps, layer) {
		this.mipmaps = mipmaps;
		this.layer = layer;

		this.zoomOffset = L.Browser.retina ? 1 : 0;

		this.options.tileSize = L.Browser.retina ? 256 : 512;
		this.options.attribution = 'Generated by <a href="https://github.com/NeoRaider/MinedMap">MinedMap</a>';

		this.options.minZoom = -(mipmaps.length-1 + this.zoomOffset);
		this.options.maxNativeZoom = -this.zoomOffset;

		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!L.Browser.android) {
			this.on('tileunload', this._onTileRemove);
		}
	},

	createTile: function (coords, done) {
		var tile = document.createElement('img');

		tile.onload = L.bind(this._tileOnLoad, this, done, tile);
		tile.onerror = L.bind(this._tileOnError, this, done, tile);

		/*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
		tile.alt = '';

		/*
		 Set role="presentation" to force screen readers to ignore this
		 https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
		*/
		tile.setAttribute('role', 'presentation');

		var z = -(coords.z + this.zoomOffset);
		if (z < 0)
			z = 0;

		var mipmap = this.mipmaps[z];

		if (coords.x >= mipmap.bounds.minX && coords.x <= mipmap.bounds.maxX &&
		    coords.y >= mipmap.bounds.minZ && coords.y <= mipmap.bounds.maxZ &&
		    contains(mipmap.regions[coords.y] || [], coords.x))
			tile.src = '/public/minedmap/data/'+this.layer+'/'+z+'/r.'+coords.x+'.'+coords.y+'.png';

		if (z === 0)
			L.DomUtil.addClass(tile, 'overzoomed');

		return tile;
	},

	_tileOnLoad: function (done, tile) {
		if (L.Browser.ielt9)
			setTimeout(Util.bind(done, this, null, tile), 0);
		else
			done(null, tile);
	},

	_tileOnError: function (done, tile, e) {
		done(e, tile);
	},

	_onTileRemove: function (e) {
		e.tile.onload = null;
	},

	_abortLoading: function () {
		var i, tile;
		for (i in this._tiles) {
			if (this._tiles[i].coords.z !== this._tileZoom) {
				tile = this._tiles[i].el;

				tile.onload = L.Util.falseFn;
				tile.onerror = L.Util.falseFn;

				if (!tile.complete) {
					tile.src = L.Util.emptyImageUrl;
					L.DomUtil.remove(tile);
				}
			}
		}
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];
		if (!tile) { return; }

		// Cancels any pending http requests associated with the tile
		// unless we're on Android's stock browser,
		// see https://github.com/Leaflet/Leaflet/issues/137
		if (!L.Browser.androidStock) {
			tile.el.setAttribute('src', L.Util.emptyImageUrl);
		}

		return L.GridLayer.prototype._removeTile.call(this, key);
	},
});


var CoordControl = L.Control.extend({
	initialize: function () {
		this.options.position = 'bottomleft';
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-attribution');

		return this._container;
	},

	update: function (x, z) {
		if (!this._map) { return; }

		this._container.innerHTML = 'X: ' + x + '&nbsp;&nbsp;&nbsp;Z: ' + z;
	}
});


var parseHash = function () {
	var args = {};

	if (window.location.hash) {
		var parts = window.location.hash.substr(1).split('&');

		for (var i = 0; i < parts.length; i++) {
			var key_value = parts[i].split('=');
			var key = key_value[0], value = key_value.slice(1).join('=');

			args[key] = value;
		}
	}

	return args;
}


window.createMap = function () {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var res = JSON.parse(this.responseText),
		    mipmaps = res.mipmaps,
		    spawn = res.spawn;

		var x, z, zoom, light;

		var updateParams = function () {
			var args = parseHash();

			zoom = parseInt(args['zoom']);
			x = parseFloat(args['x']);
			z = parseFloat(args['z']);
			light = parseInt(args['light']);

			if (isNaN(zoom))
				zoom = 0;
			if (isNaN(x))
				x = spawn.x;
			if (isNaN(z))
				z = spawn.z;
		};

		updateParams();

		var map = L.map('map', {
			center: [-z, x],
			zoom: zoom,
			minZoom: -(mipmaps.length-1),
			maxZoom: 3,
			crs: L.CRS.Simple,
			maxBounds: [
				[-512*(mipmaps[0].bounds.maxZ+1), 512*mipmaps[0].bounds.minX],
				[-512*mipmaps[0].bounds.minZ, 512*(mipmaps[0].bounds.maxX+1)],
			],
		});

		var mapLayer = new MinedMapLayer(mipmaps, 'map');
		var lightLayer = new MinedMapLayer(mipmaps, 'light');

		mapLayer.addTo(map);

		if (light)
			map.addLayer(lightLayer);

		var overlayMaps = {
			"Illumination": lightLayer,
		};

		L.control.layers({}, overlayMaps).addTo(map);

		var coordControl = new CoordControl();
		coordControl.addTo(map);

		map.on('mousemove', function(e) {
			coordControl.update(Math.round(e.latlng.lng), Math.round(-e.latlng.lat));
		});

		var makeHash = function () {
			var ret = '#x='+x+'&z='+z;

			if (zoom != 0)
				ret += '&zoom='+zoom;

			if (map.hasLayer(lightLayer))
				ret += '&light=1';

			return ret;
		};

		var updateHash = function () {
			window.location.hash = makeHash();
		};

		var refreshHash = function () {
			zoom = map.getZoom();
			center = map.getCenter();
			x = Math.round(center.lng);
			z = Math.round(-center.lat);

			updateHash();
		}

		updateHash();

		map.on('moveend', refreshHash);
		map.on('zoomend', refreshHash);
		map.on('layeradd', refreshHash);
		map.on('layerremove', refreshHash);

		window.onhashchange = function () {
			if (window.location.hash === makeHash())
				return;

			updateParams();

			map.setView([-z, x], zoom);

			if (light)
				map.addLayer(lightLayer);
			else
				map.removeLayer(lightLayer);

			updateHash();
		};

	};

	xhr.open('GET', 'data/info.json', true);
	xhr.send();
}