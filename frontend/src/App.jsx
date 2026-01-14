import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  Badge,
  IconButton,
  Box,
  Paper,
  Stack,
  Grow,
  Chip,
  Divider,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  Rating,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryIcon from "@mui/icons-material/History"; // Ikona historii
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [cart, setCart] = useState([]);
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    if (user && user.cart) setCart(user.cart);
  }, []);

  const syncCart = async (newCart, username) => {
    if (!username) return;
    try {
      await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, cart: newCart }),
      });
      const updatedUser = { ...user, cart: newCart };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }
  };

  const login = async (u, p) => {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setUser(data);
    setCart(data.cart || []);
    localStorage.setItem("user", JSON.stringify(data));
  };

  const register = async (u, p) => {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  };

  // --- NOWOŚĆ: Składanie zamówienia ---
  const placeOrder = async () => {
    if (!user || cart.length === 0) return;
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          items: cart,
          total: total,
        }),
      });

      if (res.ok) {
        // Czyścimy koszyk lokalnie i w state (backend wyczyścił u siebie)
        setCart([]);
        const updatedUser = { ...user, cart: [] };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const addToCart = (product, amount = 1) => {
    let newCart;
    const exists = cart.find((i) => i.id === product.id);
    if (exists)
      newCart = cart.map((i) =>
        i.id === product.id ? { ...i, qty: i.qty + amount } : i
      );
    else newCart = [...cart, { ...product, qty: amount }];
    setCart(newCart);
    if (user) syncCart(newCart, user.username);
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter((i) => i.id !== id);
    setCart(newCart);
    if (user) syncCart(newCart, user.username);
  };

  const clearCart = () => {
    setCart([]);
    if (user) syncCart([], user.username);
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.clear();
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        cart,
        login,
        register,
        addToCart,
        removeFromCart,
        clearCart,
        logout,
        placeOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// --- HERO & HOME (Bez zmian) ---
const Hero = () => (
  <Box
    sx={{
      bgcolor: "#f8f8f8",
      py: 8,
      mb: 6,
      textAlign: "center",
      borderBottom: "1px solid #eee",
    }}
  >
    <Container>
      <Typography
        variant="overline"
        sx={{ letterSpacing: 3, fontWeight: "bold", color: "#666" }}
      >
        NOWA KOLEKCJA 2026
      </Typography>
      <Typography
        variant="h2"
        sx={{
          fontWeight: 900,
          mt: 1,
          mb: 3,
          textTransform: "uppercase",
          letterSpacing: -1,
        }}
      >
        Styl & Technologia
      </Typography>
      <Button
        variant="outlined"
        sx={{
          borderRadius: 0,
          color: "black",
          borderColor: "black",
          px: 4,
          py: 1,
          fontWeight: "bold",
        }}
        href="#shop"
      >
        Odkryj Produkty
      </Button>
    </Container>
  </Box>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { addToCart } = useContext(StoreContext);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { label: "WSZYSTKIE", value: "all" },
    { label: "ELEKTRONIKA", value: "electronics" },
    { label: "BIŻUTERIA", value: "jewelery" },
    { label: "MODA MĘSKA", value: "men's clothing" },
    { label: "MODA DAMSKA", value: "women's clothing" },
  ];

  return (
    <Box>
      <Hero />
      <Container id="shop" sx={{ pb: 10 }}>
        <Box
          sx={{
            mb: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
            PRODUKTY
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ width: "100%", maxWidth: "800px" }}
          >
            <TextField
              placeholder="Wyszukaj..."
              variant="outlined"
              fullWidth
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 0,
                  bgcolor: "white",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 200, bgcolor: "white" }}>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 0, fontWeight: 700 }}
              >
                {categories.map((cat) => (
                  <MenuItem
                    key={cat.value}
                    value={cat.value}
                    sx={{ fontWeight: 500, textTransform: "uppercase" }}
                  >
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
        <Grid container spacing={4} alignItems="stretch">
          {filtered.map((p, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={p.id}
              sx={{ display: "flex" }}
            >
              <Grow in timeout={100}>
                <Card className="minimal-card" sx={{ width: "100%" }}>
                  <Box className="img-container">
                    <img src={p.image} alt={p.title} />
                  </Box>
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                      p: 3,
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#888",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {p.category}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1.3,
                          height: "2.6em",
                          overflow: "hidden",
                          mt: 1,
                        }}
                      >
                        {p.title}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: "auto" }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                        ${p.price}
                      </Typography>
                      <Stack spacing={1}>
                        <Button
                          fullWidth
                          className="btn-black"
                          onClick={() => addToCart(p, 1)}
                        >
                          Dodaj do koszyka
                        </Button>
                        <Button
                          fullWidth
                          component={Link}
                          to={`/product/${p.id}`}
                          sx={{
                            color: "#000",
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          Szczegóły
                        </Button>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, user } = useContext(StoreContext);
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((r) => r.json())
      .then(setP);
    fetch(`${API_URL}/api/reviews`)
      .then((r) => r.json())
      .then(setReviews);
  }, [id]);

  const handleReview = async () => {
    if (!user) return alert("Zaloguj się!");
    const res = await fetch(`${API_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: parseInt(id),
        text: comment,
        rating,
        username: user.username,
      }),
    });
    if (res.ok) window.location.reload();
    else {
      const d = await res.json();
      alert(d.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username }),
    });
    if (res.ok) window.location.reload();
    else alert("Brak uprawnień!");
  };

  if (!p) return null;
  const productReviews = reviews.filter((r) => r.productId === parseInt(id));

  return (
    <Container sx={{ py: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        component={Link}
        to="/"
        sx={{ mb: 4, color: "black", fontWeight: "bold" }}
      >
        POWRÓT
      </Button>
      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              bgcolor: "white",
              p: 6,
              border: "1px solid #eee",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={p.image}
              style={{
                width: "100%",
                maxHeight: "500px",
                objectFit: "contain",
              }}
              alt=""
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Chip
            label={p.category.toUpperCase()}
            sx={{
              borderRadius: 0,
              bgcolor: "black",
              color: "white",
              mb: 2,
              fontWeight: "bold",
            }}
          />
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, mb: 2, lineHeight: 1.1 }}
          >
            {p.title}
          </Typography>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 300 }}>
            ${p.price}
          </Typography>
          <Typography sx={{ mb: 6, lineHeight: 1.8, color: "#555" }}>
            {p.description}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 4 }} alignItems="center">
            <Typography sx={{ fontWeight: 700, mr: 2 }}>ILOŚĆ:</Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "2px solid black",
              }}
            >
              <IconButton
                onClick={() => setQty(Math.max(1, qty - 1))}
                sx={{ color: "black", borderRadius: 0 }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ px: 2, fontWeight: 900 }}>{qty}</Typography>
              <IconButton
                onClick={() => setQty(qty + 1)}
                sx={{ color: "black", borderRadius: 0 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>
          <Button
            variant="contained"
            className="btn-black"
            size="large"
            fullWidth
            sx={{ py: 2 }}
            onClick={() => addToCart(p, qty)}
          >
            DODAJ DO KOSZYKA
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ mt: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>
          OPINIE ({productReviews.length})
        </Typography>
        {user ? (
          <Box
            sx={{ mb: 6, p: 4, bgcolor: "#f9f9f9", border: "1px solid #eee" }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Dodaj opinię
            </Typography>
            <Rating
              value={rating}
              onChange={(e, v) => setRating(v)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Napisz coś..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ bgcolor: "white", mb: 2 }}
            />
            <Button className="btn-black" onClick={handleReview}>
              WYŚLIJ
            </Button>
          </Box>
        ) : (
          <Typography sx={{ mb: 4 }}>Zaloguj się, aby dodać opinię.</Typography>
        )}
        <Stack spacing={3}>
          {productReviews.map((r) => (
            <Paper
              key={r.id}
              elevation={0}
              sx={{ p: 3, border: "1px solid #eee", borderRadius: 0 }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "black" }}>
                    {r.username[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      {r.username}
                    </Typography>
                    <Rating value={r.rating} readOnly size="small" />
                  </Box>
                </Box>
                {user &&
                  (user.role === "admin" || user.username === r.username) && (
                    <IconButton
                      onClick={() => handleDeleteReview(r.id)}
                      color="error"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  )}
              </Stack>
              <Typography sx={{ mt: 2, color: "#555" }}>{r.text}</Typography>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Container>
  );
};

// --- NOWOŚĆ: STRONA MOJE ZAMÓWIENIA ---
const OrdersPage = () => {
  const { user } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/orders/${user.username}`)
        .then((r) => r.json())
        .then(setOrders);
    }
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  return (
    <Container sx={{ py: 8 }}>
      <Typography
        variant="h3"
        sx={{ fontWeight: 900, mb: 6, textAlign: "center" }}
      >
        HISTORIA ZAMÓWIEŃ
      </Typography>
      {orders.length === 0 ? (
        <Typography textAlign="center">Brak zamówień.</Typography>
      ) : (
        <Stack spacing={3}>
          {orders.reverse().map((order) => (
            <Accordion
              key={order.id}
              disableGutters
              elevation={0}
              sx={{ border: "1px solid #eee", "&:before": { display: "none" } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography sx={{ fontWeight: 700 }}>
                      ZAMÓWIENIE #{order.id.toString().slice(-6)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.date).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        textAlign: { sm: "right" },
                        mr: 2,
                      }}
                    >
                      ${order.total.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: "#f9f9f9", p: 3 }}>
                {order.items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                      borderBottom: "1px solid #eee",
                      pb: 1,
                    }}
                  >
                    <Typography>
                      {item.title} (x{item.qty})
                    </Typography>
                    <Typography sx={{ fontWeight: "bold" }}>
                      ${(item.price * item.qty).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Container>
  );
};

// --- CART (Zaktualizowany o placeOrder) ---
const Cart = () => {
  const { cart, removeFromCart, user, placeOrder } = useContext(StoreContext);
  const nav = useNavigate();
  if (!user) return <Navigate to="/login" />;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handlePayment = async () => {
    const success = await placeOrder();
    if (success) {
      alert("Zamówienie przyjęte!");
      nav("/orders"); // Przekierowanie do historii!
    } else {
      alert("Błąd składania zamówienia.");
    }
  };

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" sx={{ mb: 6, fontWeight: 900 }}>
        TWÓJ KOSZYK
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {cart.length === 0 ? (
            <Typography>Twój koszyk jest pusty.</Typography>
          ) : (
            cart.map((i) => (
              <Paper
                key={i.id}
                elevation={0}
                sx={{
                  p: 3,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #eee",
                  borderRadius: 0,
                }}
              >
                <img
                  src={i.image}
                  width="80"
                  style={{ objectFit: "contain" }}
                  alt=""
                />
                <Box sx={{ ml: 4, flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1rem", fontWeight: 700 }}
                  >
                    {i.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ilość: {i.qty}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mx: 4, fontWeight: 700 }}>
                  ${(i.price * i.qty).toFixed(2)}
                </Typography>
                <IconButton onClick={() => removeFromCart(i.id)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Paper>
            ))
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ bgcolor: "#f4f4f4", p: 4, border: "1px solid #eee" }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              PODSUMOWANIE
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 4 }}
            >
              <Typography>RAZEM</Typography>
              <Typography variant="h5" fontWeight={900}>
                ${total.toFixed(2)}
              </Typography>
            </Stack>
            <Button
              fullWidth
              className="btn-black"
              size="large"
              onClick={handlePayment}
            >
              KUPUJĘ I PŁACĘ
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

const ShippingPage = () => (
  <Container sx={{ py: 8 }}>
    <Typography
      variant="h3"
      sx={{ fontWeight: 900, mb: 4, textAlign: "center" }}
    >
      KOSZTY WYSYŁKI
    </Typography>
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #eee",
        maxWidth: 800,
        mx: "auto",
        borderRadius: 0,
      }}
    >
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: "#f9f9f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Metoda</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Czas</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Cena
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Kurier InPost</TableCell>
              <TableCell>1-2 dni</TableCell>
              <TableCell align="right">15.99 zł</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Paczkomaty 24/7</TableCell>
              <TableCell>1-2 dni</TableCell>
              <TableCell align="right">12.99 zł</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  </Container>
);

const AuthPage = ({ type }) => {
  const { login, register } = useContext(StoreContext);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const nav = useNavigate();
  const handle = async () => {
    try {
      if (type === "login") {
        await login(u, p);
        nav("/");
      } else {
        await register(u, p);
        alert("Konto utworzone!");
        nav("/login");
      }
    } catch (e) {
      alert(e.message);
    }
  };
  return (
    <Container maxWidth="xs" sx={{ py: 15 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, textAlign: "center", fontWeight: 900 }}
      >
        {type === "login" ? "ZALOGUJ SIĘ" : "ZAŁÓŻ KONTO"}
      </Typography>
      <Box sx={{ bgcolor: "white", p: 4, border: "1px solid #eee" }}>
        <TextField
          fullWidth
          label="Login"
          margin="normal"
          onChange={(e) => setU(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
        />
        <TextField
          fullWidth
          label="Hasło"
          type="password"
          margin="normal"
          sx={{ mb: 4, "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
          onChange={(e) => setP(e.target.value)}
        />
        <Button fullWidth className="btn-black" size="large" onClick={handle}>
          {type === "login" ? "ZALOGUJ" : "ZAREJESTRUJ"}
        </Button>
        {type === "login" && (
          <Button
            fullWidth
            component={Link}
            to="/register"
            sx={{ mt: 2, color: "black" }}
          >
            Nie masz konta? Zarejestruj się
          </Button>
        )}
        {type === "register" && (
          <Button
            fullWidth
            component={Link}
            to="/login"
            sx={{ mt: 2, color: "black" }}
          >
            Masz już konto? Zaloguj się
          </Button>
        )}
      </Box>
    </Container>
  );
};

// --- NAVBAR (Zaktualizowany o link do zamówień) ---
const NavBar = () => {
  const { user, cart, logout } = useContext(StoreContext);
  return (
    <AppBar position="sticky" className="navbar-clean">
      <Container>
        <Toolbar disableGutters>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              color: "black",
              textDecoration: "none",
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            ALL IN STORE
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {user ? (
              <>
                <Button
                  component={Link}
                  to="/orders"
                  startIcon={<HistoryIcon />}
                  sx={{
                    color: "black",
                    fontWeight: 700,
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  ZAMÓWIENIA
                </Button>
                <Typography
                  variant="button"
                  sx={{ display: { xs: "none", md: "block" }, fontWeight: 700 }}
                >
                  {user.username}
                </Typography>
                <IconButton onClick={logout} sx={{ color: "black" }}>
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <Button
                component={Link}
                to="/login"
                startIcon={<PersonIcon />}
                sx={{ color: "black", fontWeight: 700 }}
              >
                KONTO
              </Button>
            )}
            <IconButton component={Link} to="/cart" sx={{ color: "black" }}>
              <Badge badgeContent={cart.length} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "#000", color: "#fff", py: 8, mt: "auto" }}>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
              ALL IN STORE
            </Typography>
            <Typography variant="body2" sx={{ color: "#888", mb: 2 }}>
              Twój sklep z najnowszą technologią. Łączymy styl z
              funkcjonalnością, dostarczając produkty najwyższej jakości.
            </Typography>
            <Stack direction="row" spacing={2}>
              <IconButton sx={{ color: "white" }}>
                <FacebookIcon />
              </IconButton>
              <IconButton sx={{ color: "white" }}>
                <InstagramIcon />
              </IconButton>
              <IconButton sx={{ color: "white" }}>
                <TwitterIcon />
              </IconButton>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 900, mb: 2, textTransform: "uppercase" }}
            >
              Pomoc
            </Typography>
            <Stack spacing={1}>
              <Link
                to="/shipping"
                style={{
                  color: "#aaa",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Koszty wysyłki
              </Link>
              <Link
                to="#"
                style={{
                  color: "#aaa",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Zwroty i reklamacje
              </Link>
              <Link
                to="#"
                style={{
                  color: "#aaa",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Tabela rozmiarów
              </Link>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 900, mb: 2, textTransform: "uppercase" }}
            >
              O Nas
            </Typography>
            <Stack spacing={1}>
              <Link
                to="#"
                style={{
                  color: "#aaa",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Kariera
              </Link>
              <Link
                to="#"
                style={{
                  color: "#aaa",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Blog
              </Link>
              <Link
                to="#"
                style={{
                  color: "#aaa",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Dla prasy
              </Link>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 900, mb: 2, textTransform: "uppercase" }}
            >
              Kontakt
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
              Infolinia: +48 123 456 789
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
              Email: sklep@allinstore.com
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              ul. Technologiczna 1, 00-001 Warszawa
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: "#333", my: 4 }} />
        <Typography
          variant="caption"
          sx={{ color: "#555", textAlign: "center", display: "block" }}
        >
          © 2026 ALL IN STORE. Wszelkie prawa zastrzeżone. Projekt na
          zaliczenie.
        </Typography>
      </Container>
    </Box>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Box
          sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <NavBar />
          <Box sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/login" element={<AuthPage type="login" />} />
              <Route path="/register" element={<AuthPage type="register" />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/orders" element={<OrdersPage />} />{" "}
              {/* Nowa trasa */}
            </Routes>
          </Box>
          <Footer />
        </Box>
      </BrowserRouter>
    </StoreProvider>
  );
}
