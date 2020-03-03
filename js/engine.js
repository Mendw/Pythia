function generatePoints(ammount) {
    points = []
    for (let i = 0; i < ammount; i++) {
        points.push(
            [Math.random() * width,       //x
            Math.random() * height]        //y
        )
    }

    return points
}

function calculate_circumcenter(a, b, c) {
    const ad = a[0] * a[0] + a[1] * a[1];
    const bd = b[0] * b[0] + b[1] * b[1];
    const cd = c[0] * c[0] + c[1] * c[1];
    const D = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
    return [
        1 / D * (ad * (b[1] - c[1]) + bd * (c[1] - a[1]) + cd * (a[1] - b[1])),
        1 / D * (ad * (c[0] - b[0]) + bd * (a[0] - c[0]) + cd * (b[0] - a[0])),
    ];
}

function calculate_area(a, b, c) {
    return Math.abs(a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1])) / 2
}

function get_centroid(center, list) {
    if (!list)
        return null

    let accumulated_area = 0, sumX = 0, sumY = 0
    for (let i = 0; i < list.length - 1; i++) {
        let area = calculate_area(center, list[i], list[i + 1])
        let circumcenter = calculate_circumcenter(center, list[i], list[i + 1])

        accumulated_area += area
        sumX += circumcenter[0] * area
        sumY += circumcenter[1] * area
    }

    return [sumX / accumulated_area, sumY / accumulated_area]
}

function lloyd(times) {
    for (let i = 0; i < times; i++)
        for (let j = 0; j < delaunay.points.length / 2; j++) {
            let centroid = get_centroid([delaunay.points[j * 2], delaunay.points[j * 2 + 1]], voronoi.cellPolygon(j))
            if (!centroid) continue

            delaunay.points[j * 2 + 0] = centroid[0]
            delaunay.points[j * 2 + 1] = centroid[1]
        }

    delaunay.update()
    voronoi.update()
}

function draw_lines() {
    let prev = null
    points.forEach(point => {
        if (prev)
            line(prev[0], prev[1], point[0], point[1])

        prev = point
    });
}

function draw_circles() {
    points = delaunay.points
    for (i = 0; i < points.length / 2; i++) {
        circle(points[i * 2], points[i * 2 + 1], 5)
    }
}

function draw_triangles() {
    const { points, hull, halfedges, triangles } = delaunay

    for (let i = 0, n = halfedges.length; i < n; ++i) {
        const j = halfedges[i];
        if (j < i) continue;
        const ti = triangles[i];
        const tj = triangles[j];
        line(points[ti * 2], points[ti * 2 + 1], points[tj * 2], points[tj * 2 + 1])
    }

    let sx, sy, px, py, prx, pry
    for (let i = 0; i < hull.length; i++) {
        px = points[hull[i] * 2]
        py = points[hull[i] * 2 + 1]
        if (!(sx && sy)) {
            sx = px
            sy = py
        }

        if (prx && pry)
            line(prx, pry, px, py)

        prx = px
        pry = py
    }

    line(prx, pry, sx, sy)
}

function draw_cells() {
    const { triangles, halfedges } = delaunay
    const { circumcenters } = voronoi

    push()
    stroke(color('rgba(255, 0, 0, 0.5)'))
    for (let e = 0; e < triangles.length; e++) {
        if (e < halfedges[e]) {
            c1x = circumcenters[Math.floor(e / 3) * 2]
            c1y = circumcenters[Math.floor(e / 3) * 2 + 1]

            c2x = circumcenters[Math.floor(halfedges[e] / 3) * 2]
            c2y = circumcenters[Math.floor(halfedges[e] / 3) * 2 + 1]

            line(c1x, c1y, c2x, c2y)
        }
    }
    pop()
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight)

    delaunay = d3.Delaunay.from(generatePoints(2048))
    voronoi = delaunay.voronoi([-width/10, -height/10, width*1.1, height*1.1])

    frameRate(10)
}

function draw() {
    background(255);

    draw_circles()
    draw_triangles()
    draw_cells()

    lloyd(10)
}