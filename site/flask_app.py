

from flask import *

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/graphics")
def graphics():
    return render_template("cg.html")


if __name__ == "__main__":
    app.run("localhost", 8000)
