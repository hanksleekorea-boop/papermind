class ResearchGalaxy {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.links = [];
    this.stars = [];
    this.hoveredNode = null;
    this.selectedNode = null;
    this.isDragging = false;
    this.draggedNode = null;
    this.animationFrame = null;
    this.width = this.canvas.width = this.canvas.offsetWidth || 900;
    this.height = this.canvas.height = this.canvas.offsetHeight || 480;

    this.initStars();
    this.bindEvents();
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005
      });
    }
  }

  setPapers(papers) {
    const categoryColors = {
      'Computer Science / AI': '#3b82f6',
      'Structural Biology / AI': '#10b981',
      'Medicine / Nutritional Health': '#f59e0b',
      'Quantum Physics': '#8b5cf6',
      'Neuroscience / BCI': '#ec4899',
      'Energy / Battery': '#06b6d4',
      'Climate Science / AI': '#84cc16',
      'Default': '#6366f1'
    };

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    this.nodes = papers.map((p, idx) => {
      const angle = (idx / (papers.length || 1)) * Math.PI * 2;
      const dist = 120 + (idx % 3) * 55;
      const citations = p.citations || 100;
      const radius = Math.max(14, Math.min(32, Math.log10(citations) * 7.5));
      const color = categoryColors[p.category] || categoryColors['Default'];

      return {
        id: p.id,
        title: p.title,
        koreanTitle: p.koreanTitle || p.title,
        year: p.year,
        citations: p.citations,
        category: p.category,
        color: color,
        radius: radius,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        mass: radius
      };
    });

    this.links = [];
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        if (this.nodes[i].category === this.nodes[j].category || Math.abs(this.nodes[i].year - this.nodes[j].year) <= 2) {
          this.links.push({
            source: this.nodes[i],
            target: this.nodes[j],
            strength: 0.02
          });
        }
      }
    }

    this.startSimulation();
  }

  startSimulation() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    const animate = () => {
      this.updatePhysics();
      this.render();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  updatePhysics() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Node repulsion & centering
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      if (n1 === this.draggedNode) continue;

      // Gentle centering force
      n1.vx += (centerX - n1.x) * 0.0008;
      n1.vy += (centerY - n1.y) * 0.0008;

      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = n1.radius + n2.radius + 35;

        if (dist < minDist) {
          const force = (minDist - dist) / dist * 0.04;
          n1.vx -= dx * force;
          n1.vy -= dy * force;
          if (n2 !== this.draggedNode) {
            n2.vx += dx * force;
            n2.vy += dy * force;
          }
        }
      }

      // Damping
      n1.vx *= 0.92;
      n1.vy *= 0.92;
      n1.x += n1.vx;
      n1.y += n1.vy;

      // Bounds
      n1.x = Math.max(n1.radius + 10, Math.min(this.width - n1.radius - 10, n1.x));
      n1.y = Math.max(n1.radius + 10, Math.min(this.height - n1.radius - 10, n1.y));
    }

    // Link spring force
    for (const link of this.links) {
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const desiredDist = 130;
      const force = (dist - desiredDist) * 0.0005;

      if (link.source !== this.draggedNode) {
        link.source.vx += dx * force;
        link.source.vy += dy * force;
      }
      if (link.target !== this.draggedNode) {
        link.target.vx -= dx * force;
        link.target.vy -= dy * force;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Deep space gradient
    const bgGrad = ctx.createRadialGradient(this.width / 2, this.height / 2, 50, this.width / 2, this.height / 2, Math.max(this.width, this.height) / 1.5);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Render twinkling stars
    for (const s of this.stars) {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render links
    for (const link of this.links) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.stroke();
    }

    // Render nodes
    for (const node of this.nodes) {
      const isHovered = (this.hoveredNode === node);
      const isSelected = (this.selectedNode === node);

      // Outer glow
      const glow = ctx.createRadialGradient(node.x, node.y, node.radius * 0.5, node.x, node.y, node.radius * (isHovered ? 2.5 : 1.8));
      glow.addColorStop(0, node.color);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * (isHovered ? 2.5 : 1.8), 0, Math.PI * 2);
      ctx.fill();

      // Core planet
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = isSelected ? '#fbbf24' : (isHovered ? '#ffffff' : 'rgba(255,255,255,0.4)');
      ctx.lineWidth = isSelected ? 3 : (isHovered ? 2.5 : 1.5);
      ctx.stroke();

      // Title label
      ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
      ctx.font = isHovered ? 'bold 12px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';
      const shortTitle = (node.koreanTitle || node.title).substring(0, 16) + '...';
      ctx.fillText(shortTitle, node.x, node.y + node.radius + 14);

      // Year badge
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.font = '9px monospace';
      ctx.fillText(`(${node.year})`, node.x, node.y + node.radius + 25);
    }

    // Hover tooltip card
    if (this.hoveredNode) {
      const n = this.hoveredNode;
      const tooltipW = 260;
      const tooltipH = 80;
      let tx = n.x + n.radius + 12;
      let ty = n.y - tooltipH / 2;
      if (tx + tooltipW > this.width) tx = n.x - n.radius - tooltipW - 12;
      if (ty < 10) ty = 10;
      if (ty + tooltipH > this.height) ty = this.height - tooltipH - 10;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tooltipW, tooltipH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(n.koreanTitle || n.title.substring(0, 30), tx + 10, ty + 20);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`분야: ${n.category}`, tx + 10, ty + 38);
      ctx.fillText(`피인용수: ${n.citations?.toLocaleString() || '1,000+'}회 | 연도: ${n.year}년`, tx + 10, ty + 54);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('👉 클릭: 상세 분석 및 팟캐스트 열기', tx + 10, ty + 70);
    }
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (this.canvas.width / rect.width),
        y: (clientY - rect.top) * (this.canvas.height / rect.height)
      };
    };

    const findNode = (x, y) => {
      for (let i = this.nodes.length - 1; i >= 0; i--) {
        const n = this.nodes[i];
        const dist = Math.hypot(n.x - x, n.y - y);
        if (dist <= n.radius + 6) return n;
      }
      return null;
    };

    this.canvas.addEventListener('mousemove', (e) => {
      const pos = getPos(e);
      if (this.isDragging && this.draggedNode) {
        this.draggedNode.x = pos.x;
        this.draggedNode.y = pos.y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
      } else {
        this.hoveredNode = findNode(pos.x, pos.y);
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      const clicked = findNode(pos.x, pos.y);
      if (clicked) {
        this.isDragging = true;
        this.draggedNode = clicked;
        this.selectedNode = clicked;
        if (typeof window.onGalaxyPaperSelect === 'function') {
          window.onGalaxyPaperSelect(clicked.id);
        }
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.draggedNode = null;
    });

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      const pos = getPos(e);
      const touched = findNode(pos.x, pos.y);
      if (touched) {
        this.isDragging = true;
        this.draggedNode = touched;
        this.selectedNode = touched;
        if (typeof window.onGalaxyPaperSelect === 'function') {
          window.onGalaxyPaperSelect(touched.id);
        }
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isDragging && this.draggedNode) {
        const pos = getPos(e);
        this.draggedNode.x = pos.x;
        this.draggedNode.y = pos.y;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
      this.draggedNode = null;
    });

    window.addEventListener('resize', () => {
      this.width = this.canvas.width = this.canvas.offsetWidth || 900;
      this.height = this.canvas.height = this.canvas.offsetHeight || 480;
      this.initStars();
    });
  }
}

window.ResearchGalaxy = ResearchGalaxy;
