

(function($,_){
	var MediaItem = function(obj){
		this.id = obj.id;
		this.title = obj.title;
		this.img_url = "box_art/"+this.id+".jpg";
		this.img = $("<img/>",{src:this.img_url,alt:this.title}).data("filename",this.id+".jpg");
	};
	MediaItem.prototype.get_selection_element = function() {
		if (this.selection_element) return this.selection_element;
		return this.selection_element = $("<a/>",{href:"javascript:;"}).append(this.img);
	}
	MediaItem.prototype.toggle_on = function() {
		this.get_selection_element().focus();
		return this;
	}

	var Category = function(obj){
		var i,len;
		this.id = obj.id;
		this.title = obj.title;
		this.selections = [];
		this.highlight_class = "selection_highlight";
		for(i=0,len=obj.selections.length;i<len;i++) {
			this.selections.push(new MediaItem(obj.selections[i]));
		}
	}
	Category.prototype.get_anchor_element = function() {
		if (this.anchor_element) return this.anchor_element;
		return this.anchor_element = $("<a/>",{href:"javascript:;"})
			.data("cat_id",this.id)
			.append(this.title);
	}
	Category.prototype.get_nav_element = function() {
		if (this.nav_element) return this.nav_element;
		return this.nav_element = $("<li/>").append(this.get_anchor_element());
	}
		Category.prototype.get_article = function() {
		if (this.article) return this.article;
		return this.article = $("<article/>",{"class":this.id}).css("display","none").append(
			$("<h2/>").append(this.title)
		);
	}
	Category.prototype.toggle_on = function() {
		$(this.get_nav_element()).addClass(this.highlight_class);
		this.get_anchor_element().focus();
		return this.show_article();
	}
	Category.prototype.toggle_off = function() {
		$(this.get_nav_element()).removeClass(this.highlight_class);
		return this.hide_article();
	}
	Category.prototype.show_article = function() {
		return $(this.article).show();
	}
	Category.prototype.hide_article = function() {
		return $(this.article).hide();
	}

	var render_ui = function(categories) {
		var nav_ul = $("#selection_ui nav ul");
		var article_container = $("#selection_ui section");
		_.each(categories,function(cat){
			//put the nav elements in the nav ul
			$(nav_ul).append(cat.get_nav_element());
			//insert the article elements that will hold the media items
			$(article_container).append(cat.get_article());
			//loop the media items into the articles
			_.each(cat.selections,function(m_item){
				$(cat.get_article()).append(m_item.get_selection_element());
			})
		})
		if (categories[0]) {
			categories[0].toggle_on();
		}
	}
	var bind_ui = function(categories) {
		var LEFT = 37,
			UP = 38,
			RIGHT = 39,
			DOWN = 40,
			ENTER = 13,
			ROW_JUMP_AMOUNT=4;
		var current_cat_index = 0;
		var current_media_item_index = null;
		var url;
		var all_cats_off = function() {
			return _.each(categories,function(cat){cat.toggle_off()});
		}
		$(document).keydown(function(e) {
			if ((e.keyCode>36 && e.keyCode<41) || e.keyCode===ENTER) {
				e.preventDefault();
			}
			switch(e.keyCode) {
				case ENTER:
					url = $("a:focus img").data("filename");
					if (url) alert(url);
					break;
				case LEFT:
					if (typeof(current_media_item_index)==="number") {
						//we're in the media items, so we're good to go.
						current_media_item_index-=1;
						if (current_media_item_index<0 || (current_media_item_index!==0 && current_media_item_index!==categories[current_cat_index].selections.length-2 && (current_media_item_index % (ROW_JUMP_AMOUNT-1))===0)) {
							//we are trying to get back to the category.
							current_media_item_index=null;
							categories[current_cat_index].toggle_on();
							break;
						}
						categories[current_cat_index].selections[current_media_item_index].toggle_on();
					}
					break;
				case UP:
					if (current_media_item_index===null) {
						//we're navigating through categories
						current_cat_index-=1;
						if (current_cat_index<0) current_cat_index=0;
						all_cats_off();
						categories[current_cat_index].toggle_on();
					}else {
						//we're in the media items
						current_media_item_index-=ROW_JUMP_AMOUNT;
						if (current_media_item_index<0) {
							//reset and do nothing
							current_media_item_index+=ROW_JUMP_AMOUNT;
							break;
						}
						categories[current_cat_index].selections[current_media_item_index].toggle_on();
					}
					break;
				case RIGHT:
					if (current_media_item_index===null) {
						//we're in the categories. time to move.
						current_media_item_index=0;
						categories[current_cat_index].selections[current_media_item_index].toggle_on();
					} else {
						current_media_item_index+=1;
						if (current_media_item_index%(ROW_JUMP_AMOUNT)===0) {
							current_media_item_index-=1;
							break;
						}
						if (current_media_item_index>categories[current_cat_index].selections.length-1) {
							current_media_item_index=categories[current_cat_index].selections.length-1;
						}
						categories[current_cat_index].selections[current_media_item_index].toggle_on();
					}
					break;
				case DOWN:
					if (current_media_item_index===null) {
						//we're navigating through categories
						current_cat_index+=1;
						if (current_cat_index>categories.length-1) current_cat_index=categories.length-1;
						all_cats_off();
						categories[current_cat_index].toggle_on();
					} else {
						//we're in the media items
						current_media_item_index+=ROW_JUMP_AMOUNT;
						if (current_media_item_index>categories[current_cat_index].selections.length-1) {
							// reset and do nothing
							current_media_item_index-=ROW_JUMP_AMOUNT;
							break;
						}
						categories[current_cat_index].selections[current_media_item_index].toggle_on();
					}
					break;
			}
		})
	}
	var init_ui = function(data) {
		var categories = _.map(data.categories,function(data) {
			return new Category(data);
		});
		console.log(categories);
		render_ui(categories);
		bind_ui(categories);
	}

	var resp = $.get("media.json",init_ui);
}(jQuery,_))
