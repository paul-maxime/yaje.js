'use strict';

import Sprite from './sprite';

class TiledObject {
	constructor(layer, objectData) {
		this.id = objectData.id;
		this.name = objectData.name;
		this.type = objectData.type;
		this.visible = objectData.visible;
		this.sprite = new Sprite(objectData.width, objectData.height, null);
		this.sprite.setRotation(objectData.rotation);
		this.sprite.setPosition(objectData.x, objectData.y);
	}
}

export default class TiledMap {
	constructor(graphics, content) {
		this.graphics = graphics;
		this.content = content;
		this.sprite = new Sprite(0, 0, null);
		this.textures = {};
		this.objects = {};
		this.animationTime = 0;
		this.createObjects();
	}
	createObjects() {
		for (let layer of this.content.layers) {
			if (layer.type === 'objectgroup') {
				this.createObjectsFromLayer(layer);
			}
		}
	}
	createObjectsFromLayer(layer) {
		for (let objectData of layer.objects) {
			this.objects[objectData.id] = new TiledObject(layer, objectData);
		}
	}
	update(deltaTime) {
		this.animationTime += deltaTime * 1000;
	}
	draw() {
		for (let layer of this.content.layers) {
			if (layer.type === 'tilelayer') {
				this.drawTileLayer(layer);
			} else if (layer.type === 'objectgroup') {
				this.drawObjectGroup(layer);
			}
		}
	}
	drawTileLayer(layer) {
		if (!layer.visible) return;
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

				let tileId = this.getEffectiveTileId(tileset, gid);
				let tilesetX = tileId % tileset.columns;
				let tilesetY = Math.floor(tileId / tileset.columns);

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
	drawObjectGroup(layer) {
		if (!layer.visible) return;
		for (let objectData of layer.objects) {
			this.drawObject(this.objects[objectData.id], objectData);
		}
	}
	drawObject(object, objectData) {
		if (!object || objectData.gid === 0 || !object.visible) return;
		let gid = objectData.gid;
		for (let tileset of this.content.tilesets) {
			if (gid >= tileset.firstgid && gid <= tileset.firstgid + tileset.tilecount) {
				object.sprite.texture = this.textures[tileset.image];

				let tileId = this.getEffectiveTileId(tileset, gid);
				let tilesetX = tileId % tileset.columns;
				let tilesetY = Math.floor(tileId / tileset.columns);

				let textureX = tilesetX * tileset.tilewidth;
				let textureY = tilesetY * tileset.tileheight;
				object.sprite.setTextureCoordinates(
					textureX / tileset.imagewidth,
					textureY / tileset.imageheight,
					(textureX + tileset.tilewidth) / tileset.imagewidth,
					(textureY + tileset.tileheight) / tileset.imageheight
				);

				this.graphics.draw(object.sprite);
			}
		}
	}
	getEffectiveTileId(tileset, gid) {
		let tileId = gid - tileset.firstgid;
		if (tileset.tiles) {
			let tiledata = tileset.tiles[tileId];
			if (tiledata) {
				let animation = tiledata.animation;
				if (animation) {
					let totalTime = 0;
					for (let frame of animation) {
						totalTime += frame.duration;
					}
					let currentTime = Math.floor(this.animationTime) % totalTime;
					totalTime = 0;
					for (let frame of animation) {
						totalTime += frame.duration;
						if (totalTime >= currentTime) {
							return frame.tileid;
						}
					}
				}
			}
		}
		return tileId;
	}
	registerTexture(name, texture) {
		this.textures[name] = texture;
	}
}
