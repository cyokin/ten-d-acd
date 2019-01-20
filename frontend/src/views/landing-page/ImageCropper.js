/*! ImageCropper 27-05-2015 */
var __extends =
    this.__extends ||
    function(a, b) {
      function c() {
        this.constructor = a;
      }
      for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d]);
      (c.prototype = b.prototype), (a.prototype = new c());
    },
  Handle = (function() {
    function a(a, b, c) {
      (this.over = !1),
        (this.drag = !1),
        (this.position = new Point(a, b)),
        (this.offset = new Point(0, 0)),
        (this.radius = c);
    }
    return (
      (a.prototype.setDrag = function(a) {
        (this.drag = a), this.setOver(a);
      }),
      (a.prototype.draw = function() {}),
      (a.prototype.setOver = function(a) {
        this.over = a;
      }),
      (a.prototype.touchInBounds = function(a, b) {
        return (
          a > this.position.x - this.radius &&
          a < this.position.x + this.radius &&
          b > this.position.y - this.radius &&
          b < this.position.y + this.radius
        );
      }),
      (a.prototype.getPosition = function() {
        return this.position;
      }),
      (a.prototype.setPosition = function(a, b) {
        (this.position.x = a), (this.position.y = b);
      }),
      a
    );
  })(),
  PointPool = (function() {
    function a(b) {
      (this.borrowed = 0), (a.instance = this);
      for (var c = null, d = 0; b > d; d++)
        if (0 === d)
          (this.firstAvailable = new Point()), (c = this.firstAvailable);
        else {
          var e = new Point();
          c.setNext(e), (c = e);
        }
    }
    return (
      (a.prototype.borrow = function(a, b) {
        if (null == this.firstAvailable) throw "Pool exhausted";
        this.borrowed++;
        var c = this.firstAvailable;
        return (this.firstAvailable = c.getNext()), (c.x = a), (c.y = b), c;
      }),
      (a.prototype.returnPoint = function(a) {
        this.borrowed--,
          (a.x = 0),
          (a.y = 0),
          a.setNext(this.firstAvailable),
          (this.firstAvailable = a);
      }),
      a
    );
  })(),
  CropService = (function() {
    function a() {}
    return (
      (a.init = function(a) {
        (this.canvas = a), (this.ctx = this.canvas.getContext("2d"));
      }),
      (a.DEG2RAD = 0.0174532925),
      a
    );
  })(),
  DragMarker = (function(a) {
    function b(b, c, d) {
      a.call(this, b, c, d),
        (this.iconPoints = new Array()),
        (this.scaledIconPoints = new Array()),
        this.getDragIconPoints(this.iconPoints, 1),
        this.getDragIconPoints(this.scaledIconPoints, 1.2);
    }
    return (
      __extends(b, a),
      (b.prototype.draw = function(a) {
        this.over || this.drag
          ? this.drawIcon(a, this.scaledIconPoints)
          : this.drawIcon(a, this.iconPoints);
      }),
      (b.prototype.getDragIconPoints = function(a, b) {
        var c = 17 * b,
          d = 14 * b,
          e = 8 * b,
          f = 4 * b;
        a.push(PointPool.instance.borrow(-f / 2, c - e)),
          a.push(PointPool.instance.borrow(-d / 2, c - e)),
          a.push(PointPool.instance.borrow(0, c)),
          a.push(PointPool.instance.borrow(d / 2, c - e)),
          a.push(PointPool.instance.borrow(f / 2, c - e)),
          a.push(PointPool.instance.borrow(f / 2, f / 2)),
          a.push(PointPool.instance.borrow(c - e, f / 2)),
          a.push(PointPool.instance.borrow(c - e, d / 2)),
          a.push(PointPool.instance.borrow(c, 0)),
          a.push(PointPool.instance.borrow(c - e, -d / 2)),
          a.push(PointPool.instance.borrow(c - e, -f / 2)),
          a.push(PointPool.instance.borrow(f / 2, -f / 2)),
          a.push(PointPool.instance.borrow(f / 2, -c + e)),
          a.push(PointPool.instance.borrow(d / 2, -c + e)),
          a.push(PointPool.instance.borrow(0, -c)),
          a.push(PointPool.instance.borrow(-d / 2, -c + e)),
          a.push(PointPool.instance.borrow(-f / 2, -c + e)),
          a.push(PointPool.instance.borrow(-f / 2, -f / 2)),
          a.push(PointPool.instance.borrow(-c + e, -f / 2)),
          a.push(PointPool.instance.borrow(-c + e, -d / 2)),
          a.push(PointPool.instance.borrow(-c, 0)),
          a.push(PointPool.instance.borrow(-c + e, d / 2)),
          a.push(PointPool.instance.borrow(-c + e, f / 2)),
          a.push(PointPool.instance.borrow(-f / 2, f / 2));
      }),
      (b.prototype.drawIcon = function(a, b) {
        a.beginPath(),
          a.moveTo(b[0].x + this.position.x, b[0].y + this.position.y);
        for (var c = 0; c < b.length; c++) {
          var d = b[c];
          a.lineTo(d.x + this.position.x, d.y + this.position.y);
        }
        a.closePath(), (a.fillStyle = "rgba(255,228,0,1)"), a.fill();
      }),
      (b.prototype.recalculatePosition = function(a) {
        var b = a.getCentre();
        this.setPosition(b.x, b.y), PointPool.instance.returnPoint(b);
      }),
      b
    );
  })(Handle),
  CornerMarker = (function(a) {
    function b(b, c, d) {
      a.call(this, b, c, d);
    }
    return (
      __extends(b, a),
      (b.prototype.drawCornerBorder = function(a) {
        var b = 10;
        (this.over || this.drag) && (b = 12);
        var c = 1,
          d = 1;
        this.horizontalNeighbour.position.x < this.position.x && (c = -1),
          this.verticalNeighbour.position.y < this.position.y && (d = -1),
          a.beginPath(),
          (a.lineJoin = "miter"),
          a.moveTo(this.position.x, this.position.y),
          a.lineTo(this.position.x + b * c, this.position.y),
          a.lineTo(this.position.x + b * c, this.position.y + b * d),
          a.lineTo(this.position.x, this.position.y + b * d),
          a.lineTo(this.position.x, this.position.y),
          a.closePath(),
          (a.lineWidth = 2),
          (a.strokeStyle = "rgba(255,228,0,1)"),
          a.stroke();
      }),
      (b.prototype.drawCornerFill = function(a) {
        var b = 10;
        (this.over || this.drag) && (b = 12);
        var c = 1,
          d = 1;
        this.horizontalNeighbour.position.x < this.position.x && (c = -1),
          this.verticalNeighbour.position.y < this.position.y && (d = -1),
          a.beginPath(),
          a.moveTo(this.position.x, this.position.y),
          a.lineTo(this.position.x + b * c, this.position.y),
          a.lineTo(this.position.x + b * c, this.position.y + b * d),
          a.lineTo(this.position.x, this.position.y + b * d),
          a.lineTo(this.position.x, this.position.y),
          a.closePath(),
          (a.fillStyle = "rgba(0,0,0,1)"),
          a.fill();
      }),
      (b.prototype.moveX = function(a) {
        this.setPosition(a, this.position.y);
      }),
      (b.prototype.moveY = function(a) {
        this.setPosition(this.position.x, a);
      }),
      (b.prototype.move = function(a, b) {
        this.setPosition(a, b),
          this.verticalNeighbour.moveX(a),
          this.horizontalNeighbour.moveY(b);
      }),
      (b.prototype.addHorizontalNeighbour = function(a) {
        this.horizontalNeighbour = a;
      }),
      (b.prototype.addVerticalNeighbour = function(a) {
        this.verticalNeighbour = a;
      }),
      (b.prototype.getHorizontalNeighbour = function() {
        return this.horizontalNeighbour;
      }),
      (b.prototype.getVerticalNeighbour = function() {
        return this.verticalNeighbour;
      }),
      (b.prototype.draw = function(a) {
        this.drawCornerFill(a), this.drawCornerBorder(a);
      }),
      b
    );
  })(Handle),
  Bounds = (function() {
    function a(a, b, c, d) {
      void 0 === a && (a = 0),
        void 0 === b && (b = 0),
        void 0 === c && (c = 0),
        void 0 === d && (d = 0),
        (this.left = a),
        (this.right = a + c),
        (this.top = b),
        (this.bottom = b + d);
    }
    return (
      (a.prototype.getWidth = function() {
        return Math.abs(this.right - this.left);
      }),
      (a.prototype.getHeight = function() {
        return Math.abs(this.bottom - this.top);
      }),
      (a.prototype.getCentre = function() {
        var a = this.getWidth(),
          b = this.getHeight();
        return PointPool.instance.borrow(this.left + a / 2, this.top + b / 2);
      }),
      a
    );
  })(),
  Point = (function() {
    function a(a, b) {
      void 0 === a && (a = 0),
        void 0 === b && (b = 0),
        (this.x = a),
        (this.y = b);
    }
    return (
      (a.prototype.setNext = function(a) {
        this.next = a;
      }),
      (a.prototype.getNext = function() {
        return this.next;
      }),
      a
    );
  })(),
  CropTouch = (function() {
    function a(a, b, c) {
      void 0 === a && (a = 0),
        void 0 === b && (b = 0),
        void 0 === c && (c = 0),
        (this.id = 0),
        (this.x = a),
        (this.y = b),
        (this.id = c);
    }
    return a;
  })(),
  ImageCropper = (function() {
    function a(a, b, c, d, e, f, g) {
      void 0 === b && (b = 0),
        void 0 === c && (c = 0),
        void 0 === d && (d = 100),
        void 0 === e && (e = 50),
        void 0 === f && (f = !0),
        void 0 === g && (g = 20),
        (this.keepAspect = !1),
        (this.aspectRatio = 0),
        (this.currentDragTouches = new Array()),
        (this.isMouseDown = !1),
        (this.ratioW = 1),
        (this.ratioH = 1),
        (this.fileType = "png"),
        (this.imageSet = !1),
        (this.pointPool = new PointPool(200)),
        CropService.init(a),
        (this.buffer = document.createElement("canvas")),
        (this.cropCanvas = document.createElement("canvas")),
        (this.buffer.width = a.width),
        (this.buffer.height = a.height),
        (this.tl = new CornerMarker(b, c, g)),
        (this.tr = new CornerMarker(b + d, c, g)),
        (this.bl = new CornerMarker(b, c + e, g)),
        (this.br = new CornerMarker(b + d, c + e, g)),
        this.tl.addHorizontalNeighbour(this.tr),
        this.tl.addVerticalNeighbour(this.bl),
        this.tr.addHorizontalNeighbour(this.tl),
        this.tr.addVerticalNeighbour(this.br),
        this.bl.addHorizontalNeighbour(this.br),
        this.bl.addVerticalNeighbour(this.tl),
        this.br.addHorizontalNeighbour(this.bl),
        this.br.addVerticalNeighbour(this.tr),
        (this.markers = [this.tl, this.tr, this.bl, this.br]),
        (this.center = new DragMarker(b + d / 2, c + e / 2, g)),
        (this.canvas = a),
        (this.ctx = this.canvas.getContext("2d")),
        (this.keepAspect = f),
        (this.aspectRatio = e / d),
        this.draw(this.ctx),
        (this.croppedImage = new Image()),
        (this.currentlyInteracting = !1),
        window.addEventListener("mousemove", this.onMouseMove.bind(this)),
        window.addEventListener("mouseup", this.onMouseUp.bind(this)),
        a.addEventListener("mousedown", this.onMouseDown.bind(this)),
        window.addEventListener("touchmove", this.onTouchMove.bind(this), !1),
        a.addEventListener("touchstart", this.onTouchStart.bind(this), !1),
        window.addEventListener("touchend", this.onTouchEnd.bind(this), !1);
    }
    return (
      (a.prototype.resizeCanvas = function(a, b) {
        (this.canvas.width = a),
          (this.canvas.height = b),
          (this.buffer.width = a),
          (this.buffer.height = b),
          this.draw(this.ctx);
      }),
      (a.prototype.draw = function(a) {
        var b = this.getBounds();
        if (this.srcImage) {
          a.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
          var c = this.srcImage.height / this.srcImage.width,
            d = this.canvasHeight / this.canvasWidth,
            e = this.canvasWidth,
            f = this.canvasHeight;
          d > c
            ? ((e = this.canvasWidth), (f = this.canvasWidth * c))
            : ((f = this.canvasHeight), (e = this.canvasHeight / c)),
            (this.ratioW = e / this.srcImage.width),
            (this.ratioH = f / this.srcImage.height),
            c > d
              ? this.drawImageIOSFix(
                  a,
                  this.srcImage,
                  0,
                  0,
                  this.srcImage.width,
                  this.srcImage.height,
                  this.buffer.width / 2 - e / 2,
                  0,
                  e,
                  f
                )
              : this.drawImageIOSFix(
                  a,
                  this.srcImage,
                  0,
                  0,
                  this.srcImage.width,
                  this.srcImage.height,
                  0,
                  this.buffer.height / 2 - f / 2,
                  e,
                  f
                ),
            this.buffer
              .getContext("2d")
              .drawImage(
                this.canvas,
                0,
                0,
                this.canvasWidth,
                this.canvasHeight
              ),
            (a.fillStyle = "rgba(0, 0, 0, 0.7)"),
            a.fillRect(0, 0, this.canvasWidth, this.canvasHeight),
            a.drawImage(
              this.buffer,
              b.left,
              b.top,
              Math.max(b.getWidth(), 1),
              Math.max(b.getHeight(), 1),
              b.left,
              b.top,
              b.getWidth(),
              b.getHeight()
            );
          for (var g, h = 0; h < this.markers.length; h++)
            (g = this.markers[h]), g.draw(a);
          this.center.draw(a),
            (a.lineWidth = 2),
            (a.strokeStyle = "rgba(255,228,0,1)"),
            a.strokeRect(b.left, b.top, b.getWidth(), b.getHeight());
        } else
          (a.fillStyle = "rgba(192,192,192,1)"),
            a.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }),
      (a.prototype.dragCrop = function(a, b, c) {
        var d = this.getBounds(),
          e = a - d.getWidth() / 2,
          f = a + d.getWidth() / 2,
          g = b - d.getHeight() / 2,
          h = b + d.getHeight() / 2;
        f >= this.maxXClamp && (a = this.maxXClamp - d.getWidth() / 2),
          e <= this.minXClamp && (a = d.getWidth() / 2 + this.minXClamp),
          g < this.minYClamp && (b = d.getHeight() / 2 + this.minYClamp),
          h >= this.maxYClamp && (b = this.maxYClamp - d.getHeight() / 2),
          this.tl.moveX(a - d.getWidth() / 2),
          this.tl.moveY(b - d.getHeight() / 2),
          this.tr.moveX(a + d.getWidth() / 2),
          this.tr.moveY(b - d.getHeight() / 2),
          this.bl.moveX(a - d.getWidth() / 2),
          this.bl.moveY(b + d.getHeight() / 2),
          this.br.moveX(a + d.getWidth() / 2),
          this.br.moveY(b + d.getHeight() / 2),
          c.setPosition(a, b);
      }),
      (a.prototype.dragCorner = function(a, b, c) {
        var d,
          e = 0,
          f = 0,
          g = 0,
          h = 0,
          i = 0,
          j = 0,
          k = 0,
          l = 0,
          m = 0;
        this.keepAspect
          ? ((d = c.getHorizontalNeighbour().getVerticalNeighbour()),
            (g = d.getPosition().x),
            (h = d.getPosition().y),
            a <= d.getPosition().x
              ? b <= d.getPosition().y
                ? ((e = g - 100 / this.aspectRatio),
                  (f = h - (100 / this.aspectRatio) * this.aspectRatio),
                  (m = this.getSide(
                    PointPool.instance.borrow(e, f),
                    d.getPosition(),
                    PointPool.instance.borrow(a, b)
                  )),
                  m > 0
                    ? ((i = Math.abs(d.getPosition().y - b)),
                      (j = i / this.aspectRatio),
                      (k = d.getPosition().y - i),
                      (l = d.getPosition().x - j),
                      c.move(l, k))
                    : 0 > m &&
                      ((j = Math.abs(d.getPosition().x - a)),
                      (i = j * this.aspectRatio),
                      (k = d.getPosition().y - i),
                      (l = d.getPosition().x - j),
                      c.move(l, k)))
                : ((e = g - 100 / this.aspectRatio),
                  (f = h + (100 / this.aspectRatio) * this.aspectRatio),
                  (m = this.getSide(
                    PointPool.instance.borrow(e, f),
                    d.getPosition(),
                    PointPool.instance.borrow(a, b)
                  )),
                  m > 0
                    ? ((j = Math.abs(d.getPosition().x - a)),
                      (i = j * this.aspectRatio),
                      (k = d.getPosition().y + i),
                      (l = d.getPosition().x - j),
                      c.move(l, k))
                    : 0 > m &&
                      ((i = Math.abs(d.getPosition().y - b)),
                      (j = i / this.aspectRatio),
                      (k = d.getPosition().y + i),
                      (l = d.getPosition().x - j),
                      c.move(l, k)))
              : b <= d.getPosition().y
                ? ((e = g + 100 / this.aspectRatio),
                  (f = h - (100 / this.aspectRatio) * this.aspectRatio),
                  (m = this.getSide(
                    PointPool.instance.borrow(e, f),
                    d.getPosition(),
                    PointPool.instance.borrow(a, b)
                  )),
                  0 > m
                    ? ((i = Math.abs(d.getPosition().y - b)),
                      (j = i / this.aspectRatio),
                      (k = d.getPosition().y - i),
                      (l = d.getPosition().x + j),
                      c.move(l, k))
                    : m > 0 &&
                      ((j = Math.abs(d.getPosition().x - a)),
                      (i = j * this.aspectRatio),
                      (k = d.getPosition().y - i),
                      (l = d.getPosition().x + j),
                      c.move(l, k)))
                : ((e = g + 100 / this.aspectRatio),
                  (f = h + (100 / this.aspectRatio) * this.aspectRatio),
                  (m = this.getSide(
                    PointPool.instance.borrow(e, f),
                    d.getPosition(),
                    PointPool.instance.borrow(a, b)
                  )),
                  0 > m
                    ? ((j = Math.abs(d.getPosition().x - a)),
                      (i = j * this.aspectRatio),
                      (k = d.getPosition().y + i),
                      (l = d.getPosition().x + j),
                      c.move(l, k))
                    : m > 0 &&
                      ((i = Math.abs(d.getPosition().y - b)),
                      (j = i / this.aspectRatio),
                      (k = d.getPosition().y + i),
                      (l = d.getPosition().x + j),
                      c.move(l, k))))
          : c.move(a, b),
          this.center.recalculatePosition(this.getBounds());
      }),
      (a.prototype.getSide = function(a, b, c) {
        var d = this.sign(
          (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
        );
        return (
          PointPool.instance.returnPoint(a),
          PointPool.instance.returnPoint(c),
          d
        );
      }),
      (a.prototype.sign = function(a) {
        return +a === a ? (0 === a ? a : a > 0 ? 1 : -1) : 0 / 0;
      }),
      (a.prototype.handleRelease = function(a) {
        for (var b = 0, c = 0; c < this.currentDragTouches.length; c++)
          a.id == this.currentDragTouches[c].id &&
            (this.currentDragTouches[c].dragHandle.setDrag(!1),
            (a.dragHandle = null),
            (b = c));
        this.currentDragTouches.splice(b, 1), this.draw(this.ctx);
      }),
      (a.prototype.handleMove = function(a) {
        for (var b = !1, c = 0; c < this.currentDragTouches.length; c++)
          if (
            a.id == this.currentDragTouches[c].id &&
            null != this.currentDragTouches[c].dragHandle
          ) {
            var d = this.currentDragTouches[c],
              e = this.clampPosition(
                a.x - d.dragHandle.offset.x,
                a.y - d.dragHandle.offset.y
              );
            (a.x = e.x),
              (a.y = e.y),
              PointPool.instance.returnPoint(e),
              d.dragHandle instanceof CornerMarker
                ? this.dragCorner(a.x, a.y, d.dragHandle)
                : this.dragCrop(a.x, a.y, d.dragHandle),
              (this.currentlyInteracting = !0),
              (b = !0);
            break;
          }
        if (!b) {
          for (var f = 0; f < this.markers.length; f++) {
            var g = this.markers[f];
            if (g.touchInBounds(a.x, a.y)) {
              (a.dragHandle = g),
                this.currentDragTouches.push(a),
                g.setDrag(!0),
                (a.dragHandle.offset.x = a.x - a.dragHandle.getPosition().x),
                (a.dragHandle.offset.y = a.y - a.dragHandle.getPosition().y),
                this.dragCorner(
                  a.x - a.dragHandle.offset.x,
                  a.y - a.dragHandle.offset.y,
                  a.dragHandle
                );
              break;
            }
          }
          null == a.dragHandle &&
            this.center.touchInBounds(a.x, a.y) &&
            ((a.dragHandle = this.center),
            this.currentDragTouches.push(a),
            a.dragHandle.setDrag(!0),
            (a.dragHandle.offset.x = a.x - a.dragHandle.getPosition().x),
            (a.dragHandle.offset.y = a.y - a.dragHandle.getPosition().y),
            this.dragCrop(
              a.x - a.dragHandle.offset.x,
              a.y - a.dragHandle.offset.y,
              a.dragHandle
            ));
        }
      }),
      (a.prototype.updateClampBounds = function() {
        var a = this.srcImage.height / this.srcImage.width,
          b = this.canvas.height / this.canvas.width,
          c = this.canvas.width,
          d = this.canvas.height;
        b > a
          ? ((c = this.canvas.width), (d = this.canvas.width * a))
          : ((d = this.canvas.height), (c = this.canvas.height / a)),
          (this.minXClamp = this.canvas.width / 2 - c / 2),
          (this.minYClamp = this.canvas.height / 2 - d / 2),
          (this.maxXClamp = this.canvas.width / 2 + c / 2),
          (this.maxYClamp = this.canvas.height / 2 + d / 2);
      }),
      (a.prototype.getCropBounds = function() {
        var a = this.canvas.height - 2 * this.minYClamp,
          b = this.getBounds();
        return (
          (b.top = Math.round((a - b.top + this.minYClamp) / this.ratioH)),
          (b.bottom = Math.round(
            (a - b.bottom + this.minYClamp) / this.ratioH
          )),
          (b.left = Math.round((b.left - this.minXClamp) / this.ratioW)),
          (b.right = Math.round((b.right - this.minXClamp) / this.ratioW)),
          b
        );
      }),
      (a.prototype.clampPosition = function(a, b) {
        return (
          a < this.minXClamp && (a = this.minXClamp),
          a > this.maxXClamp && (a = this.maxXClamp),
          b < this.minYClamp && (b = this.minYClamp),
          b > this.maxYClamp && (b = this.maxYClamp),
          PointPool.instance.borrow(a, b)
        );
      }),
      (a.prototype.isImageSet = function() {
        return this.imageSet;
      }),
      (a.prototype.setImage = function(a) {
        if (!a) throw "Image is null";
        (this.imageSet = !0),
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var b = this.buffer.getContext("2d");
        b.clearRect(0, 0, this.buffer.width, this.buffer.height);
        var c = a.src.split("."),
          d = c[1];
        ("png" == d || "jpg" == d) && (this.fileType = d),
          (this.srcImage = a),
          this.updateClampBounds();
        var e = this.srcImage.height / this.srcImage.width,
          f = this.getBounds(),
          g = f.getHeight() / f.getWidth(),
          h = this.canvas.width,
          i = this.canvas.height;
        (this.canvasWidth = h), (this.canvasHeight = i);
        var j = this.canvas.width / 2,
          k = this.canvas.height / 2,
          l = PointPool.instance.borrow(
            j - f.getWidth() / 2,
            k + f.getHeight() / 2
          ),
          m = PointPool.instance.borrow(
            j + f.getWidth() / 2,
            k + f.getHeight() / 2
          ),
          n = PointPool.instance.borrow(
            j - f.getWidth() / 2,
            k - f.getHeight() / 2
          ),
          o = PointPool.instance.borrow(
            j + f.getWidth() / 2,
            k - f.getHeight() / 2
          );
        if (
          (this.tl.setPosition(l.x, l.y),
          this.tr.setPosition(m.x, m.y),
          this.bl.setPosition(n.x, n.y),
          this.br.setPosition(o.x, o.y),
          PointPool.instance.returnPoint(l),
          PointPool.instance.returnPoint(m),
          PointPool.instance.returnPoint(n),
          PointPool.instance.returnPoint(o),
          this.center.setPosition(j, k),
          g > e)
        ) {
          var p = Math.min(h * e, i);
          if (f.getHeight() > p) {
            var q = p / g;
            (l = PointPool.instance.borrow(j - q / 2, k + p / 2)),
              (m = PointPool.instance.borrow(j + q / 2, k + p / 2)),
              (n = PointPool.instance.borrow(j - q / 2, k - p / 2)),
              (o = PointPool.instance.borrow(j + q / 2, k - p / 2)),
              this.tl.setPosition(l.x, l.y),
              this.tr.setPosition(m.x, m.y),
              this.bl.setPosition(n.x, n.y),
              this.br.setPosition(o.x, o.y),
              PointPool.instance.returnPoint(l),
              PointPool.instance.returnPoint(m),
              PointPool.instance.returnPoint(n),
              PointPool.instance.returnPoint(o);
          }
        } else if (e > g) {
          var r = Math.min(i / e, h);
          if (f.getWidth() > r) {
            var s = r * g;
            (l = PointPool.instance.borrow(j - r / 2, k + s / 2)),
              (m = PointPool.instance.borrow(j + r / 2, k + s / 2)),
              (n = PointPool.instance.borrow(j - r / 2, k - s / 2)),
              (o = PointPool.instance.borrow(j + r / 2, k - s / 2)),
              this.tl.setPosition(l.x, l.y),
              this.tr.setPosition(m.x, m.y),
              this.bl.setPosition(n.x, n.y),
              this.br.setPosition(o.x, o.y),
              PointPool.instance.returnPoint(l),
              PointPool.instance.returnPoint(m),
              PointPool.instance.returnPoint(n),
              PointPool.instance.returnPoint(o);
          }
        }
        (this.vertSquashRatio = this.detectVerticalSquash(a)),
          this.draw(this.ctx);
      }),
      (a.prototype.getCroppedImage = function(a, b) {
        var c = this.getBounds();
        if (!this.srcImage) throw "Source image not set.";
        if (a && b) {
          var d = this.srcImage.height / this.srcImage.width,
            e = this.canvas.height / this.canvas.width,
            f = this.canvas.width,
            g = this.canvas.height;
          e > d
            ? ((f = this.canvas.width), (g = this.canvas.width * d))
            : d > e
              ? ((g = this.canvas.height), (f = this.canvas.height / d))
              : ((g = this.canvas.height), (f = this.canvas.width)),
            (this.ratioW = f / this.srcImage.width),
            (this.ratioH = g / this.srcImage.height),
            (this.cropCanvas.width = a),
            (this.cropCanvas.height = b);
          var h = (this.buffer.height - g) / 2 / this.ratioH,
            i = (this.buffer.width - f) / 2 / this.ratioW;
          this.drawImageIOSFix(
            this.cropCanvas.getContext("2d"),
            this.srcImage,
            Math.max(Math.round(c.left / this.ratioW - i), 0),
            Math.max(Math.round(c.top / this.ratioH - h), 0),
            Math.max(Math.round(c.getWidth() / this.ratioW), 1),
            Math.max(Math.round(c.getHeight() / this.ratioH), 1),
            0,
            0,
            a,
            b
          ),
            (this.croppedImage.width = a),
            (this.croppedImage.height = b);
        } else
          (this.cropCanvas.width = Math.max(c.getWidth(), 1)),
            (this.cropCanvas.height = Math.max(c.getHeight(), 1)),
            this.cropCanvas
              .getContext("2d")
              .drawImage(
                this.buffer,
                c.left,
                c.top,
                Math.max(c.getWidth(), 1),
                Math.max(c.getHeight(), 1),
                0,
                0,
                c.getWidth(),
                c.getHeight()
              ),
            (this.croppedImage.width = this.cropCanvas.width),
            (this.croppedImage.height = this.cropCanvas.height);
        return (
          (this.croppedImage.src = this.cropCanvas.toDataURL(
            "image/" + this.fileType
          )),
          this.croppedImage
        );
      }),
      (a.prototype.setBounds = function(a) {
        for (
          var b, c, d, e, f = this.getBounds(), g = 0;
          g < this.markers.length;
          g++
        ) {
          var h = this.markers[g];
          h.getPosition().x == f.left
            ? h.getPosition().y == f.top
              ? (b = h)
              : (d = h)
            : h.getPosition().y == f.top
              ? (c = h)
              : (e = h);
        }
        b.setPosition(a.left, a.top),
          c.setPosition(a.right, a.top),
          d.setPosition(a.left, a.bottom),
          e.setPosition(a.right, a.bottom),
          this.center.recalculatePosition(a),
          this.center.draw(this.ctx);
      }),
      (a.prototype.getBounds = function() {
        for (
          var a = Number.MAX_VALUE,
            b = Number.MAX_VALUE,
            c = -Number.MAX_VALUE,
            d = -Number.MAX_VALUE,
            e = 0;
          e < this.markers.length;
          e++
        ) {
          var f = this.markers[e];
          f.getPosition().x < a && (a = f.getPosition().x),
            f.getPosition().x > c && (c = f.getPosition().x),
            f.getPosition().y < b && (b = f.getPosition().y),
            f.getPosition().y > d && (d = f.getPosition().y);
        }
        var g = new Bounds();
        return (g.left = a), (g.right = c), (g.top = b), (g.bottom = d), g;
      }),
      (a.prototype.getMousePos = function(a, b) {
        var c = a.getBoundingClientRect();
        return PointPool.instance.borrow(b.clientX - c.left, b.clientY - c.top);
      }),
      (a.prototype.getTouchPos = function(a, b) {
        var c = a.getBoundingClientRect();
        return PointPool.instance.borrow(b.clientX - c.left, b.clientY - c.top);
      }),
      (a.prototype.onTouchMove = function(a) {
        if (this.isImageSet()) {
          if ((a.preventDefault(), a.touches.length >= 1))
            for (var b = 0; b < a.touches.length; b++) {
              var c = a.touches[b],
                d = this.getTouchPos(this.canvas, c),
                e = new CropTouch(d.x, d.y, c.identifier);
              PointPool.instance.returnPoint(d), this.move(e, a);
            }
          this.draw(this.ctx);
        }
      }),
      (a.prototype.onMouseMove = function(a) {
        if (this.isImageSet()) {
          var b = this.getMousePos(this.canvas, a);
          this.move(new CropTouch(b.x, b.y, 0), a);
          var c = this.getDragTouchForID(0);
          c ? ((c.x = b.x), (c.y = b.y)) : (c = new CropTouch(b.x, b.y, 0)),
            PointPool.instance.returnPoint(b),
            this.drawCursors(c, a),
            this.draw(this.ctx);
        }
      }),
      (a.prototype.move = function(a) {
        this.isMouseDown && this.handleMove(a);
      }),
      (a.prototype.getDragTouchForID = function(a) {
        for (var b = 0; b < this.currentDragTouches.length; b++)
          if (a == this.currentDragTouches[b].id)
            return this.currentDragTouches[b];
      }),
      (a.prototype.drawCursors = function(a, b) {
        var c = !1;
        null != a &&
          (a.dragHandle == this.center &&
            ((document.body.style.cursor = "move"), (c = !0)),
          null != a.dragHandle &&
            a.dragHandle instanceof CornerMarker &&
            (this.drawCornerCursor(
              a.dragHandle,
              a.dragHandle.getPosition().x,
              a.dragHandle.getPosition().y,
              b
            ),
            (c = !0)));
        var d = !1;
        if (!c) {
          for (var e = 0; e < this.markers.length; e++)
            d = d || this.drawCornerCursor(this.markers[e], a.x, a.y, b);
          d || (document.body.style.cursor = "initial");
        }
        d || c || !this.center.touchInBounds(a.x, a.y)
          ? this.center.setOver(!1)
          : (this.center.setOver(!0), (document.body.style.cursor = "move"));
      }),
      (a.prototype.drawCornerCursor = function(a, b, c) {
        return a.touchInBounds(b, c)
          ? (a.setOver(!0),
            (document.body.style.cursor =
              a.getHorizontalNeighbour().getPosition().x > a.getPosition().x
                ? a.getVerticalNeighbour().getPosition().y > a.getPosition().y
                  ? "nwse-resize"
                  : "nesw-resize"
                : a.getVerticalNeighbour().getPosition().y > a.getPosition().y
                  ? "nesw-resize"
                  : "nwse-resize"),
            !0)
          : (a.setOver(!1), !1);
      }),
      (a.prototype.onMouseDown = function() {
        this.isImageSet() && (this.isMouseDown = !0);
      }),
      (a.prototype.onTouchStart = function() {
        this.isImageSet() && (this.isMouseDown = !0);
      }),
      (a.prototype.onTouchEnd = function(a) {
        if (this.isImageSet()) {
          for (var b = 0; b < a.changedTouches.length; b++) {
            var c = a.changedTouches[b],
              d = this.getDragTouchForID(c.identifier);
            null != d &&
              ((d.dragHandle instanceof CornerMarker ||
                d.dragHandle instanceof DragMarker) &&
                d.dragHandle.setOver(!1),
              this.handleRelease(d));
          }
          0 === this.currentDragTouches.length &&
            ((this.isMouseDown = !1), (this.currentlyInteracting = !1));
        }
      }),
      (a.prototype.onMouseUp = function() {
        this.isImageSet() &&
          (this.handleRelease(new CropTouch(0, 0, 0)),
          (this.currentlyInteracting = !1),
          0 === this.currentDragTouches.length && (this.isMouseDown = !1));
      }),
      (a.prototype.drawImageIOSFix = function(a, b, c, d, e, f, g, h, i, j) {
        a.drawImage(
          b,
          c * this.vertSquashRatio,
          d * this.vertSquashRatio,
          e * this.vertSquashRatio,
          f * this.vertSquashRatio,
          g,
          h,
          i,
          j
        );
      }),
      (a.prototype.detectVerticalSquash = function(a) {
        var b = (a.naturalWidth, a.naturalHeight),
          c = document.createElement("canvas");
        (c.width = 1), (c.height = b);
        var d = c.getContext("2d");
        d.drawImage(a, 0, 0);
        for (
          var e = d.getImageData(0, 0, 1, b).data, f = 0, g = b, h = b;
          h > f;

        ) {
          var i = e[4 * (h - 1) + 3];
          0 === i ? (g = h) : (f = h), (h = (g + f) >> 1);
        }
        var j = h / b;
        return 0 === j ? 1 : j;
      }),
      a
    );
  })();
window.ImageCropper = ImageCropper;