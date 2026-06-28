# NASA Space Apps 2025 — StellarCanvas

StellarCanvas is the actively maintained continuation of our NASA Space Apps 2025 project. Originally developed during the hackathon, the project has since evolved beyond its prototype with new features, ongoing improvements, and long-term maintenance.

It is an interactive astronomical image explorer built with a Next.js frontend and a FastAPI backend, enabling deep-zoom exploration of planetary imagery.

> [!NOTE]
> This repository is forked from `ketjandr/nasa-spaceapps-project` as part of our commitment to continue developing the project beyond the NASA Space Apps hackathon.
>
> If you're looking for the original hackathon submission, please refer to the original repository. This repository contains the latest, actively maintained version of StellarCanvas.

---

## Prerequisites

Before getting started, ensure you have the following installed:

* Python 3.11 or newer
* Node.js 20 or newer
* npm

---

## Getting Started

### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then configure the following variables as needed:

| Variable                      | Description                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_BACKEND_URL`     | URL of the FastAPI backend. For local development, this is typically `http://localhost:8000`. |
| `NEXT_PUBLIC_GAIA_SKYMAP_URL` | Optional. Overrides the default Milky Way panorama.                                           |

---

### 2. Start the Backend

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the Python dependencies:

```bash
pip install -r backend/requirements.txt
```

Run the FastAPI development server:

```bash
uvicorn backend.main:app --reload
```

The backend provides API endpoints and proxies astronomical imagery used by the frontend.

---

### 3. Start the Frontend

Open a new terminal:

```bash
npm install
npm run dev
```

The application will be available at:

* **Frontend:** http://localhost:3000
* **Backend API:** http://localhost:8000

---

## Project Structure

```text
.
├── backend/          # FastAPI backend
├── public/           # Static assets
├── src/              # Next.js application
├── .env.example
└── README.md
```

---

## Technology Stack

* **Next.js** — React framework for the frontend
* **TypeScript**
* **Tailwind CSS**
* **FastAPI** — Backend API
* **OpenSeadragon** — Deep-zoom image viewer
* **WMTS** Milky Way and planetary imagery (proxied through FastAPI)

---

## Screenshot

> *Coming soon.*

---

## Contributing

Contributions, bug reports, feature requests, and pull requests are welcome. If you'd like to improve StellarCanvas, feel free to open an issue or submit a pull request.

---

## License

MIT
