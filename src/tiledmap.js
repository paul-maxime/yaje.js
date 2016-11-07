'use strict';

import Sprite from './sprite';

export default class TiledMap {
	constructor(graphics, content) {
		this.graphics = graphics;
		this.content = content;
		this.sprite = new Sprite(0, 0, null);
		this.textures = {};
	}
	update(deltaTime) {
		// TODO update the animations
	}
	draw() {
		for (let layer of this.content.layers) {
			if (layer.type === 'tilelayer') {
				this.drawTileLayer(layer);
			}
		}
	}
	drawTileLayer(layer) {
		this.sprite.setColor(1.0, 1.0, 1.0, layer.opacity);
		for (let x = 0; x < layer.width; ++x) {
			for (let y = 0; y < layer.height; ++y) {
				let gid = layer.data[y * layer.width + x];
				this.drawTile(gid, x, y);
			}
		}
	}
	drawTile(gid, tileX, tileY) {
		if (gid === 0) return;
		
		for (let tileset of this.content.tilesets) {
			if (gid >= tileset.firstgid && gid <= tileset.firstgid + tileset.tilecount) {
				this.sprite.texture = this.textures[tileset.image];
				this.sprite.width = tileset.tilewidth;
				this.sprite.height = tileset.tileheight;
				this.sprite.setPosition(
					this.content.tilewidth * tileX,
					this.content.tileheight * tileY
				);
				
				let tilesetIndex = gid - tileset.firstgid;
				let tilesetX = tilesetIndex % tileset.columns;
				let tilesetY = Math.floor(tilesetIndex / tileset.columns);
				
				let textureX = tilesetX * tileset.tilewidth;
				let textureY = tilesetY * tileset.tileheight;
				this.sprite.setTextureCoordinates(
					textureX / tileset.imagewidth,
					textureY / tileset.imageheight,
					(textureX + tileset.tilewidth) / tileset.imagewidth,
					(textureY + tileset.tileheight) / tileset.imageheight
				);
				
				this.graphics.draw(this.sprite);
			}
		}
	}
	registerTexture(name, texture) {
		this.textures[name] = texture;
	}
}
