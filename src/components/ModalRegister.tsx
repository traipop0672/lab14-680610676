import { useState } from "react";
import { loadTasks, saveTasks } from "../libs/Storage";

type RegisterForm = {
  fname: string;
  lname: string;
  plan: string;
  gender: string;
  items: string[];
};

// ---- แผนการวิ่ง ----
const plans = [
  { id: "funrun", label: "Fun run 5.5 Km", price: 500 },
  { id: "mini", label: "Mini Marathon 10 Km", price: 800 },
  { id: "half", label: "Half Marathon 21 Km", price: 1200 },
  { id: "full", label: "Full Marathon 42.195 Km", price: 1500 },
];

// ---- สินค้าเสริม ----
const extraItems = [
  { id: "bottle", label: "Bottle 🍼", price: 200 },
  { id: "shoes", label: "Shoes 👟", price: 600 },
  { id: "cap", label: "Cap 🧢", price: 400 },
];

export default function ModalRegister({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<RegisterForm>({
    fname: "",
    lname: "",
    plan: "",
    gender: "",
    items: [],
  });

  const [agree, setAgree] = useState(false);

  const [errors, setErrors] = useState({
    fname: false,
    lname: false,
    plan: false,
    gender: false,
  });

  const updateForm = (key: keyof RegisterForm, value: string) => {
    setErrors((prev) => ({ ...prev, [key]: false }));

    if (key === "items") {
      setForm((prev) => ({
        ...prev,
        items: prev.items.includes(value)
          ? prev.items.filter((e) => e !== value)
          : [...prev.items, value],
      }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const isAllItemsSelected =
    extraItems.length > 0 && form.items.length === extraItems.length;

  const computeTotalPayment = () => {
    let total = 0;

    const selectedPlan = plans.find((p) => p.label === form.plan);
    if (selectedPlan) total += selectedPlan.price;

    let itemsPrice = form.items.reduce((sum, itemId) => {
      const item = extraItems.find((e) => e.id === itemId);
      return sum + (item ? item.price : 0);
    }, 0);

    if (isAllItemsSelected) {
      return (total + itemsPrice) * 0.8;
    }

    return total + itemsPrice;
  };

  const registerBtnOnClick = () => {
    const newErrors = {
      fname: form.fname.trim() === "",
      lname: form.lname.trim() === "",
      plan: form.plan === "",
      gender: form.gender === "",
    };
    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((isError) => isError);
    if (hasError) return;

    const total = computeTotalPayment();

    const newItem = {
      id: Date.now(),
      fullName: form.fname + form.lname,
      plan: form.plan,
      gender: form.gender,
      items: form.items,
      total: computeTotalPayment(),
    };

    const currentList = loadTasks();
    saveTasks([...currentList, newItem]);
    alert(
      `Registration complete. Please pay money for ${total.toLocaleString()} THB.`,
    );
    onClose();
  };

  return (
    <>
      <div
        className="modal fade show d-block"
        id="modalregister"
        tabIndex={-1}
        role="dialog"
        style={{ display: "block" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Register CMU Marathon 🏃‍♂️</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              {/* ชื่อและนามสกุล */}
              <div className="d-flex gap-2">
                <div className="w-50">
                  <label className="form-label">First name</label>
                  <input
                    className={`form-control ${errors.fname ? "is-invalid" : ""}`}
                    onChange={(e) => updateForm("fname", e.target.value)}
                    value={form.fname}
                  />
                  <div className="invalid-feedback">Invalid first name</div>
                </div>
                <div className="w-50">
                  <label className="form-label">Last name</label>
                  <input
                    className={`form-control ${errors.lname ? "is-invalid" : ""}`}
                    onChange={(e) => updateForm("lname", e.target.value)}
                    value={form.lname}
                  />
                  <div className="invalid-feedback">Invalid last name</div>
                </div>
              </div>

              {/* แผนการวิ่ง */}
              <div className="mt-2">
                <label className="form-label">Plan</label>
                <select
                  className={`form-select ${errors.plan ? "is-invalid" : ""}`}
                  value={form.plan}
                  onChange={(e) => updateForm("plan", e.target.value)}
                >
                  <option value="">Please select..</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.label}>
                      {p.label} ({p.price.toLocaleString()} THB)
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">Please select a Plan</div>
              </div>

              {/* เพศ */}
              <div className="mt-2">
                <label className="form-label d-block">Gender</label>
                <div>
                  <input
                    className="me-2 form-check-input"
                    type="radio"
                    name="gender"
                    id="gender-male"
                    checked={form.gender === "male"}
                    onChange={() => updateForm("gender", "male")}
                  />
                  <label
                    className="form-check-label me-3"
                    htmlFor="gender-male"
                  >
                    Male 👨
                  </label>

                  <input
                    className="me-2 form-check-input"
                    type="radio"
                    name="gender"
                    id="gender-female"
                    checked={form.gender === "female"}
                    onChange={() => updateForm("gender", "female")}
                  />
                  <label className="form-check-label" htmlFor="gender-female">
                    Female 👩
                  </label>
                </div>
                {errors.gender && (
                  <div className="text-danger small mt-1">
                    Please select gender
                  </div>
                )}
              </div>

              {/* สินค้าเสริม (Extra Items) */}
              <div className="mt-3">
                <label className="form-label d-block">Extra Item(s)</label>
                {extraItems.map((item) => (
                  <div key={item.id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={form.items.includes(item.id)}
                      onChange={() => updateForm("items", item.id)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`item-${item.id}`}
                    >
                      {item.label} ({item.price.toLocaleString()} THB)
                    </label>
                  </div>
                ))}

                {/* แสดงข้อความลดราคาเมื่อเลือกครบทุกชิ้น */}
                {isAllItemsSelected && (
                  <span className="text-success d-block fw-semibold mt-1">
                    (20% Discounted)
                  </span>
                )}
              </div>

              <div className="alert alert-primary mt-3" role="alert">
                Promotion📢 Buy all items to get 20% Discount
              </div>

              <div className="fw-bold fs-5 mt-2">
                Total Payment : {computeTotalPayment().toLocaleString()} THB
              </div>
            </div>

            <div className="modal-footer">
              <div className="me-auto">
                <input
                  className="form-check-input me-2"
                  type="checkbox"
                  id="agreeCheck"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="agreeCheck">
                  I agree to the terms and conditions
                </label>
              </div>

              <button
                className="btn btn-success"
                onClick={registerBtnOnClick}
                disabled={!agree}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
