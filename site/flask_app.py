

from flask import *

app = Flask(__name__)


@app.route("/baskan03321_")
def baskan():
    return render_template("baskan.html")

@app.route("/graphics_legacy")
def graphics():
    return render_template("cg.html")

@app.route("/perspective")
def perspective():
    return render_template("cg.html")

@app.route("/")
def index():
    return graphics()


if __name__ == "__main__":
    app.run("localhost", 8000)
