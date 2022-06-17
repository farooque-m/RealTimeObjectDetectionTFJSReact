import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from "../../assets/images/AddIcon.png";
import MinusIcon from "../../assets/images/MinusIcon.png";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { useHistory, useLocation } from "react-router-dom";
import NoImage from "../../assets/images/NoImage.png";
import { checkIfItemIsAlchohol, prependSlashBasedOnQuantityType, quantityWithRatingBasis, updateAddonsWithChangeInQuantity } from "../../helpers/utils";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { quantityTypeByRatingBasis } from "../../helpers/utils";
import { checkForOffer, priceForItem } from "../../helpers/utils";
import Quantity from "./Quantity";
import AddonsContainer from "./AddOns";
import useTranslation from "../../hooks/useTranslation";
const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: "12px",
    "&:hover": {
      backgroundColor: "#e3f5fc",
    },
  },
  media: {
    height: "94px",
    width: "94px",
    position: "relative",
    objectFit: "contain",
  },
  buttonAddDesktop: {
    margin: "12px 8px 13px 0px",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "4px",
    backgroundColor: "#E9F5FA",
    fontSize: "14px",
    padding: "13px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#00AAF1",
      color: "white",
    },
  },

  buttonAddMobile: {
    width: "100%",
    margin: "5px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    height: "40px",
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up(500)]: {
      display: "block",
    },
  },
  sectionMobile: {
    display: "block",
    [theme.breakpoints.up(500)]: {
      display: "none",
    },
  },
  webDialog: {
    "& .css-1t1j96h-MuiPaper-root-MuiDialog-paper": {
      borderRadius: "1.5vw",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
    },
  },
  webDialogSlider: {
    overflow: "scroll",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
}));

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


function Product({
  name,
  image,
  item_id,
  category_name,
  stockQuantity,
  rating_basis,
  productItem,
  sectionName,
  productCategoriesName,
  onDetailsClick,
  isFromSearch,
  handleOpenAddonsFromSearch,
  handleOpenQuantityFromSearch
}) {
  const history = useHistory();
  const [cartQuantity, setCartQuantity] = useState(0);
  const [open, setOpen] = useState(false);
  const [openAddons, setOpenAddons] = useState(false);
  const dispatch = useDispatch();
  const { getLabel } = useTranslation()
  const location = useLocation();
  const cartItem = useSelector((state) => state.productItems.cart);
  const offers = useSelector((state) => state.offers.offers);
  const [outOfStockAlert, setOutOfStockAlert] = useState(false);
  const [, setUpdateQuantity] = useState(false);
  const applicableOffer = checkForOffer({ item_id: productItem.item_id, offers })
  const { isShowAgeRestrictionPopup } = useSelector(store => store.store)
  const { storeParameters } = useSelector(store => store.store)
  const vertical = "top";
  const horizontal = "right";
  const handleClickOutOfStock = () => {
    setOutOfStockAlert(true);
  };
  const handleCloseOutOfStock = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOutOfStockAlert(false);
  };

  const handleClickOpenQuantityPopup = () => {
    if (isFromSearch) {
      handleOpenQuantityFromSearch({ item: updatedItem, quantity: cartQuantity, applicableOffer: applicableOffer })
    }
    else {
      setOpen(true);

    }
  };
  const handleCloseQuantityPopup = () => {
    setOpen(false);
  };
  function checkStockQuantity(value) {
    if (cartQuantity + value > stockQuantity) {
      handleClickOutOfStock()
      return (cartQuantity)
    } else {
      return cartQuantity + value
    }
  }

  const addQuantity = (e) => {
    e.stopPropagation();
    if (productItem.addons?.length > 0) {
      if (isFromSearch) {
        handleOpenAddonsFromSearch({ item: updatedItem, quantity: cartQuantity + 1, applicableOffer: applicableOffer })
      }
      openAddonsPopup()
    }
    if (rating_basis === "PER_CT") {
      cartQuantity >= 0 &&
        (dispatch({
          type: "UPDATE_ITEM",
          payload: {
            item_id: item_id,
            selectedQuantity: checkStockQuantity(1),
          },
        }))
    }
    if (rating_basis === "PER_WT") {
      cartQuantity >= 0 &&
        (dispatch({
          type: "UPDATE_ITEM",
          payload: {
            item_id: item_id,
            selectedQuantity: checkStockQuantity(0.25),
          },
        }))
    }

    if (rating_basis === "PER_CT_WT") {
      cartQuantity >= 0 &&
        (dispatch({
          type: "UPDATE_ITEM",
          payload: {
            item_id: item_id,
            selectedQuantity: checkStockQuantity(1)
          },
        }))
    }
  };
  const removeQuantity = (e) => {
    if (cartQuantity - quantityWithRatingBasis(productItem.rating_basis) >= 0) onItemUpdate(updateAddonsWithChangeInQuantity({ newValue: cartQuantity - quantityWithRatingBasis(productItem.rating_basis), itemAddons: productItem?.addons, itemId: item_id }))
    if (productItem.addons?.length > 0 && cartQuantity - quantityWithRatingBasis(productItem.rating_basis) > 0) {
      if (isFromSearch) {
        handleOpenAddonsFromSearch({ item: updatedItem, quantity: cartQuantity - 1, applicableOffer: applicableOffer })
      }
      openAddonsPopup()
    }
    e.stopPropagation();
    if (rating_basis === "PER_CT") {
      cartQuantity >= 0 &&
        (dispatch({
          type: "UPDATE_ITEM",
          payload: {
            item_id: item_id,
            selectedQuantity: cartQuantity - 1
          },
        }))
    }
    if (rating_basis === "PER_WT") {
      cartQuantity >= 0 &&
        (dispatch({
          type: "UPDATE_ITEM",
          payload: {
            item_id: item_id,
            selectedQuantity: cartQuantity - 0.25
          },
        }))
    }
    if (rating_basis === "PER_CT_WT") {
      cartQuantity >= 0 &&
        (dispatch({
          type: "UPDATE_ITEM",
          payload: {
            item_id: item_id,
            selectedQuantity: cartQuantity - 1
          },
        }))
    }

  };
  useEffect(() => {
    const item = cartItem.find(item => item.name === name)
    if (item) {
      setCartQuantity(item.selectedQuantity)
    } else {
      setCartQuantity(0)
    }
  }, [name, cartItem]);
  function productDetailsPage() {
    history.push(`/product_details/${item_id}&${category_name}`,
      {
        ...updatedItem,
        path: location.pathname,
        sectionName,
        productCategoriesName,
      });
  }

  const addToCart = (e) => {
    e.stopPropagation();
    if (checkIfItemIsAlchohol({ categoryId: productItem.category_id, storeParameters: storeParameters }) && !isShowAgeRestrictionPopup.isAlreadySelected) {
      dispatch({
        type: "SHOW_AGE_RESTRICTION_POPUP",
        payload: {
          isShow: true,
          isClickingFromSearch: isFromSearch || false,
          item: {
            ...updatedItem,
          }
        }
      })
      dispatch({ type: "SHOW_SEARCH_POPUP", payload: false });
    } else {
      if (productItem.addons?.length > 0) {
        if (isFromSearch) {
          handleOpenAddonsFromSearch({ item: updatedItem, quantity: cartQuantity + 1, applicableOffer: applicableOffer })
        } else {
          openAddonsPopup();
        }
      }
      dispatch({
        type: "ADD_TO_CART",
        payload: {
          ...updatedItem,
        },
      });
    }
  };

  const updatedItem = {
    ...productItem,
    name,
    stockQuantity,
    applied_offer: applicableOffer || {},
    userQuantityType: quantityTypeByRatingBasis({ rating_basis: rating_basis, quantity_type: productItem.quantity_type, }),
    selectedQuantity: 1,
    orginalQuantity: productItem.quantity,
  }

  function addToCartUpdate(e) {
    e.stopPropagation();
    handleClickOpenQuantityPopup();
    setUpdateQuantity(true);
  }
  const handleDetailsClick = () => {
    productDetailsPage()
    if (onDetailsClick) onDetailsClick()
  }

  const onItemUpdate = (item) => {
    dispatch({
      type: "UPDATE_ADD_ONS",
      payload: {
        item_id: item_id,
        add_ons: item,
      }
    })
  }
  const openAddonsPopup = () => {
    setOpenAddons(true);
  }
  const free = true;
  const classes = useStyles();
  return (
    <div style={{ position: "relative" }}>
      <div className={classes.sectionDesktop}>
        <div
          id={`product_${item_id}_${name}`}
          onClick={handleDetailsClick}
          style={{
            width: "212px",
            height: "292px",
            color: "rgba(62, 88, 99, 1)",
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            zIndex: "2",
            cursor: "pointer",
          }}
          className={classes.root}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{
                width: "196px",
                height: "119px",
                border: "1px solid lightgrey",
                borderRadius: "1vw",
                backgroundColor: "white",
                margin: "8px",
              }} >
                {Object.keys(applicableOffer).length > 0 && <div style={{ backgroundColor: "rgba(255, 80, 35, 1)", padding: "2px 6px 2px 6px", width: "fit-content", marginLeft: "auto", marginRight: "10px", color: "white", fontSize: "12px", borderRadius: "3px", marginTop: "-8px", zIndex: "99" }}>
                  <div>{(applicableOffer.primary_text ? applicableOffer.primary_text : "") + " " + (applicableOffer.secondary_text ? applicableOffer.secondary_text : "")}</div>
                </div>}
                <div
                  style={{
                    display: "grid",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "10px"
                  }}
                >
                  <img
                    id={`product_image_${item_id}`}
                    className={classes.media}
                    src={image ? image : NoImage}
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div style={{}}>
              <Typography
                style={{
                  marginLeft: "12px",
                  fontSize: "14px",
                  fontFamily: "nunito",
                  color: "#3E5863",
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                {productItem.rating_basis !== "PER_CT" && <span style={{ fontSize: "14px", color: "red", marginRight: "2px", fontWeight: "400" }}>* </span>}{name}
              </Typography>
            </div>
          </div>

          <div style={{ marginLeft: "12px" }}>
            <Typography
              style={{
                fontSize: "14px",
              }}
            >
              <b>${priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis, }).toFixed(2)}</b> {prependSlashBasedOnQuantityType(quantityTypeByRatingBasis({ rating_basis: rating_basis, quantity_type: productItem.quantity_type }))}
            </Typography>
            {cartQuantity ? (
              <div
                style={{
                  margin: "12px 8px 13px 0px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "5px",
                  flex: 1,
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  height: "41px",
                }}
              >
                <button
                  style={{
                    color: "rgba(0, 170, 241, 1)",
                    display: "grid",
                    border: "none",
                    backgroundColor: "transparent",
                    alignItems: "center",
                    cursor: "pointer",
                    height: "100%",
                    padding: "0px 15px",
                  }}
                  id={`decrement_quantity_in_product_${item_id}_${name}`}
                  onClick={(e) => removeQuantity(e)}
                >
                  <img style={{ width: "14px" }} src={MinusIcon} alt="" />
                </button>
                <div
                  style={{ width: "100%", height: "100%", cursor: "pointer" }}
                  id={`quantity_selection_product_${item_id}_${name}`}
                  onClick={(e) => addToCartUpdate(e)}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: "rgba(38, 59, 67, 1)",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {cartQuantity} {""} {quantityTypeByRatingBasis({ rating_basis: rating_basis, quantity_type: productItem.quantity_type, })}
                      </div>
                      <div style={{ display: "flex", alignContent: "center", }}>
                        <div style={{
                          fontSize: "12px",
                          textDecoration: Object.keys(applicableOffer).length &&
                            ((priceForItem({ offer: true, productItem: { ...productItem, applied_offer: applicableOffer }, cartQuantity: cartQuantity, rating_basis: rating_basis })) !== ((cartQuantity) * priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis }))) ? "line-through" : "none",
                          color: Object.keys(applicableOffer).length
                            &&
                            ((priceForItem({ offer: true, productItem: { ...productItem, applied_offer: applicableOffer }, cartQuantity: cartQuantity, rating_basis: rating_basis })) !== ((cartQuantity) * priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis })))
                            ? "rgba(255, 106, 41, 1)" : "rgba(38, 59, 67, 0.8)"
                        }}>
                          ${((cartQuantity) * priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis })).toFixed(2)}
                        </div>
                        {Object.keys(applicableOffer).length > 0 && ((priceForItem({ offer: true, productItem: { ...productItem, applied_offer: applicableOffer }, cartQuantity: cartQuantity, rating_basis: rating_basis })) !== ((cartQuantity) * priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis }))) && <div style={{ fontSize: "12px", marginLeft: "2px" }}>${(priceForItem({ offer: true, productItem: { ...productItem, applied_offer: applicableOffer }, cartQuantity: cartQuantity, rating_basis: rating_basis })).toFixed(2)}</div>}
                      </div>
                    </div>
                    <KeyboardArrowDown
                      style={{
                        fontSize: "14px",
                        color: "grey",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    color: "rgba(0, 170, 241, 1)",
                    display: "grid",
                    alignItems: "center",
                    cursor: "pointer",
                    height: "100%",
                    padding: "0px 15px",
                  }}
                  id={`decrement_quantity_in_product_${item_id}_${name}`}
                  onClick={(e) => addQuantity(e)}
                >
                  <img style={{ width: "14px" }} src={AddIcon} alt="" />
                </div>
              </div>
            ) : (
              stockQuantity >= 1 ? (
                <div
                  onClick={(e) => addToCart(e)}
                  id={`add_to_cart_product_${item_id}_${name}`}
                  className={classes.buttonAddDesktop}
                >
                  <b>{getLabel('add-to-cart')}</b>
                  <b>+</b>
                </div>) : (
                <div style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  color: "rgba(38, 59, 67, 1)",
                  margin: "12px 8px 13px 0px",
                  border: "none",
                  alignItems: "center",
                  borderRadius: "4px",
                  backgroundColor: "rgba(80, 110, 123, 0.2)",
                  fontWeight: 700,
                  fontSize: "14px",
                  padding: "13px",
                  cursor: "pointer",
                }} >{getLabel('no-stock')}</div>
              )
            )}
          </div>
        </div>
      </div>
      {open && <Quantity open={open} onClose={handleCloseQuantityPopup} openAddons={() => setOpenAddons(true)} quantityTypeInHeader={productItem.quantity_type} name={name} item_id={item_id} quantity={1} cartQuantity={cartQuantity} stockQuantity={stockQuantity} quantity_type={quantityTypeByRatingBasis({ rating_basis: rating_basis, quantity_type: productItem.quantity_type, })} price={priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis, })} rating_basis={rating_basis} productItem={productItem} applicableOffer={applicableOffer} />}
      {openAddons && <AddonsContainer isOpen={openAddons} itemInfo={updatedItem} selectedQuantity={cartQuantity} onSelectChange={onItemUpdate} onClose={() => setOpenAddons(false)} opencustomQuantityPopup={() => setOpen(true)} />}
      <Snackbar anchorOrigin={{ vertical, horizontal }} open={outOfStockAlert} autoHideDuration={6000} onClose={handleCloseOutOfStock} key={vertical + horizontal}>
        <Alert onClose={handleCloseOutOfStock} severity="error" sx={{ width: '100%' }}>
          {getLabel('you-have-reached-the-maximum-quantity-for-this-product')}
        </Alert>
      </Snackbar>
      <div style={{ margin: "7px" }} className={classes.sectionMobile}>
        <div
          id={`product_mobile_${item_id}_${name}`}
          key={name}
          onClick={productDetailsPage}
          style={{
            boxShadow: "0px 1px 7px 0px rgba(193,182,182,0.4)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "160px",
            height: "215px",
            borderRadius: "10px",
            justifyContent: "space-between",
          }}
        >
          {Object.keys(applicableOffer).length > 0 && <div
            style={{
              backgroundColor: "#FF5023",
              fontSize: "10px",
              borderRadius: "3px",
              padding: "2px 4px 2px 4px",
              width: "fit-content",
              marginLeft: "auto",
              marginTop: "-8px",
              color: "white",
            }}
          >
            {(applicableOffer.primary_text ? applicableOffer.primary_text : "") + " " + (applicableOffer.secondary_text ? applicableOffer.secondary_text : "")}
          </div>}
          <div>
            <div
              style={{
                display: "grid",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                backgroundColor: "white",

              }}
            >
              <img
                id={`product_image_${item_id}`}
                style={{ margin: "3.29px 39px 9px 39px", width: "82.81px", height: "82.81px", objectFit: "contain" }}
                className={classes.media}
                src={image ? image : NoImage}
                alt=""
                title="Contemplative Reptile"
              />
            </div>

            <div style={{ marginLeft: "10.75px" }}>
              <Typography
                style={{
                  fontSize: "12px",
                  fontFamily: "nunito",
                  color: "#3E5863",
                  height: "38px",
                }}
              >
                {productItem.rating_basis !== "PER_CT" && <span style={{ fontSize: "14px", color: "red", fontWeight: "400" }}>* </span>}{name}
              </Typography>
              {!free && (
                <button
                  style={{
                    marginLeft: "1vw",
                    background: "white",
                    border: "1px solid red",
                    borderRadius: "3px",
                    color: "red",
                    fontSize: "3vw",
                  }}
                >
                  {getLabel('free-delivery')}
                </button>
              )}
            </div>
          </div>
          <div>
            <Typography
              style={{
                marginLeft: "10.75px",
                fontWeight: "bold",
                fontSize: "12px",
                marginTop: "auto",
              }}
            >
              ${priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis, }).toFixed(2)}
            </Typography>
            <div>
              {cartQuantity ? (
                <div
                  style={{
                    margin: "4px",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "5px",
                    flex: 1,
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    height: "42px",
                  }}
                >
                  <button
                    style={{
                      color: "rgba(0, 170, 241, 1)",
                      display: "grid",
                      border: "none",
                      backgroundColor: "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      height: "100%",
                      padding: "0px 12px",
                      borderRight: "1px solid rgba(80, 110, 123, 0.2)",
                    }}
                    id={`decrement_quantity_mobile_${item_id}_${name}`}
                    onClick={(e) => removeQuantity(e)}
                  >
                    <img style={{ width: "10px" }} src={MinusIcon} alt="" />
                  </button>
                  <div
                    style={{ width: "100%", height: "100%", cursor: "pointer" }}
                    id={`quantity_selection_mobile_${item_id}_${name}`}
                    onClick={(e) => addToCartUpdate(e)}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "rgba(38, 59, 67, 1)",
                        }}
                      >
                        <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                          {cartQuantity}
                          {""} {quantityTypeByRatingBasis({ rating_basis: rating_basis, quantity_type: productItem.quantity_type, })}
                        </div>
                        <div style={{ display: "flex", alignContent: "center", }}>
                          <div style={{
                            fontSize: "10px",
                            textDecoration: Object.keys(applicableOffer).length && ((priceForItem({ offer: true, productItem: { ...productItem, applied_offer: applicableOffer }, cartQuantity: cartQuantity, rating_basis: rating_basis })) !== ((cartQuantity) * priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis }))) ? "line-through" : "none",
                            color: Object.keys(applicableOffer).length && ((priceForItem({ offer: true, productItem: { ...productItem, applied_offer: applicableOffer }, cartQuantity: cartQuantity, rating_basis: rating_basis })) !== ((cartQuantity) * priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis }))) ? "rgba(255, 106, 41, 1)" : "rgba(38, 59, 67, 0.8)"
                          }}>${((cartQuantity) * priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis })).toFixed(2)}</div>
                          {Object.keys(applicableOffer).length > 0 && ((priceForItem({ offer: true, productItem: { ...productItem, applied_offer: applicableOffer }, cartQuantity: cartQuantity, rating_basis: rating_basis })) !== ((cartQuantity) * priceForItem({ offer: false, productItem: productItem, cartQuantity: cartQuantity, rating_basis: rating_basis }))) && <div style={{ fontSize: "10px", marginLeft: "2px" }}>${(priceForItem({ offer: true, productItem: { ...productItem, applied_offer: applicableOffer }, cartQuantity: cartQuantity, rating_basis: rating_basis })).toFixed(2)}</div>}
                        </div>
                      </div>
                      <KeyboardArrowDown
                        style={{
                          fontSize: "14px",
                          color: "grey",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      borderLeft: "1px solid rgba(80, 110, 123, 0.2)",
                      color: "rgba(0, 170, 241, 1)",
                      display: "grid",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      height: "100%",
                      padding: "0px 12px",
                    }}
                    id={`increment_quantity_mobile_${item_id}_${name}`}
                    onClick={(e) => addQuantity(e)}
                  >
                    <img style={{ width: "10px" }} src={AddIcon} alt="" />
                  </div>
                </div>
              ) : (
                <button
                  className={classes.buttonAddMobile}
                  style={{
                    backgroundColor: stockQuantity >= 1 ? "#00AAF1" : "rgba(80, 110, 123, 0.2)",
                    width: "95%",
                    padding: "12px",
                    height: "42px",
                    fontWeight: "bold",
                  }}
                  id={`add_to_cart_mobile_${item_id}_${name}`}
                  disabled={stockQuantity < 1}
                  onClick={(e) => addToCart(e)}
                >
                  {stockQuantity ? (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "14px",
                      fontFamily: "nunito",
                      justifyContent: "space-between",
                    }}>
                      <div>{getLabel('add')}</div>
                      <div>+</div>
                    </div>
                  ) : (<div style={{ display: "flex", justifyContent: "flex-start", color: "rgba(38, 59, 67, 1)" }} >{getLabel('no-stock')}</div>)}

                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Product;
